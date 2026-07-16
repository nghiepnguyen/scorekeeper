import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { AppHeader } from './components/AppHeader'
import { Ranking } from './components/Ranking'
import { ScoreInput } from './components/ScoreInput'
import { Setup } from './components/Setup'
import { Summary } from './components/Summary'
import { VictoryPopup } from './components/VictoryPopup'
import {
  trackGameEnd,
  trackGameReset,
  trackGameStart,
  trackLanguageChange,
  trackRoundAdd,
  trackRoundDeleteLast,
  trackRoundEditLast,
  trackSetupPlayerChange,
  trackShareResult,
  trackSummaryBackToMatch,
  trackVictoryContinue,
  trackVictoryPopupView,
} from './lib/analytics'
import { getCopy } from './lib/copy'
import { MIN_PLAYERS } from './lib/constants'
import { computePlayerStats } from './lib/playerStats'
import {
  emptyRoundInputs,
  normalizeRoundInput,
  reachesWinningScore,
  simulateScoresAfterAdd,
  simulateScoresAfterEditLast,
  sortPlayers,
} from './lib/roundScoring'
import { buildShareText } from './lib/shareText'
import { useGameStore } from './store/gameStore'
import { useRoomSync } from './hooks/useRoomSync'
import type { Language, Player } from './types'

type VictoryCelebration = {
  winners: Player[]
  targetScore: number
}

function leadersAtTop(sortedPlayers: Player[]): Player[] {
  const topScore = sortedPlayers[0]?.score
  if (topScore === undefined) {
    return []
  }
  return sortedPlayers.filter((player) => player.score === topScore)
}

function App() {
  const {
    gameStarted,
    players,
    rounds,
    winningScore,
    gameEnded,
    startGame,
    addRound,
    updateLastRound,
    deleteLastRound,
    setGameEnded,
    resetGame,
    leaveRoom,
    roomCode,
    isHost,
    syncStatus,
    createRoom,
    joinRoom,
  } = useGameStore()

  useRoomSync()

  const readOnly = roomCode !== null && !isHost

  const [startingScore, setStartingScore] = useState('0')
  const [winningScoreInput, setWinningScoreInput] = useState('')
  const [playerNames, setPlayerNames] = useState(['', ''])
  const [roundInputs, setRoundInputs] = useState<Record<string, string>>({})
  const [copyStatus, setCopyStatus] = useState('')
  const [autoEndedByWinningScore, setAutoEndedByWinningScore] = useState(false)
  const [language, setLanguage] = useState<Language>('vi')
  const [showConfetti, setShowConfetti] = useState(false)
  const [showVictoryPopup, setShowVictoryPopup] = useState(false)
  const [victoryPopupData, setVictoryPopupData] = useState<VictoryCelebration | null>(null)
  const [victoryEndedManually, setVictoryEndedManually] = useState(false)
  const [setupError, setSetupError] = useState('')
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [joinRoomError, setJoinRoomError] = useState('')
  const [roomLinkStatus, setRoomLinkStatus] = useState('')
  const confettiTimerRef = useRef<number | null>(null)
  const playerInputRefs = useRef<Array<HTMLInputElement | null>>([])
  const shouldFocusNewPlayerRef = useRef(false)
  const [transitionStage, setTransitionStage] = useState<'idle' | 'entering'>('idle')
  const [updatedPlayerIds, setUpdatedPlayerIds] = useState<Set<string>>(new Set())

  const t = getCopy(language)

  useEffect(() => {
    if (gameStarted || gameEnded) {
      requestAnimationFrame(() => {
        setTransitionStage('entering')
      })
      const timer = setTimeout(() => setTransitionStage('idle'), 500)
      return () => clearTimeout(timer)
    }
  }, [gameStarted, gameEnded])

  const sortedPlayers = useMemo(() => sortPlayers(players), [players])
  const leaderScore = sortedPlayers[0]?.score

  const winners = useMemo(() => {
    if (winningScore === null) {
      return []
    }
    return sortedPlayers.filter((player) => player.score >= winningScore)
  }, [sortedPlayers, winningScore])

  const winnerNotice = useMemo(() => {
    if (winningScore === null || winners.length === 0 || rounds.length === 0) {
      return ''
    }
    if (winners.length === 1) {
      return t.winnerSingle(`${winners[0].emoji} ${winners[0].name}`, winningScore)
    }
    const winnerNames = winners.map((player) => `${player.emoji} ${player.name}`).join(', ')
    return t.winnerMulti(winners.length, winnerNames, winningScore)
  }, [rounds.length, t, winners, winningScore])

  const playerStats = useMemo(() => computePlayerStats(players, rounds), [players, rounds])
  const shareText = useMemo(
    () => buildShareText(t, sortedPlayers, playerStats, rounds.length, winningScore),
    [playerStats, rounds.length, sortedPlayers, t, winningScore],
  )

  const openVictoryPopup = (celebration: VictoryCelebration, fromManualEnd: boolean) => {
    setVictoryPopupData(celebration)
    setVictoryEndedManually(fromManualEnd)
    setAutoEndedByWinningScore(true)
    setShowVictoryPopup(true)
    trackVictoryPopupView(celebration.winners.length, celebration.targetScore)
  }

  const closeVictoryPopup = () => {
    setShowVictoryPopup(false)
    setVictoryPopupData(null)
    setVictoryEndedManually(false)
  }

  const buildThresholdCelebration = (scoresAfterRound: number[]): VictoryCelebration | null => {
    if (winningScore === null) {
      return null
    }
    const updatedPlayers = players.map((player, index) => ({ ...player, score: scoresAfterRound[index] }))
    const thresholdWinners = updatedPlayers.filter((player) => player.score >= winningScore)
    if (thresholdWinners.length === 0) {
      return null
    }
    return {
      winners: sortPlayers(thresholdWinners),
      targetScore: winningScore,
    }
  }

  const handleVictoryContinue = () => {
    const celebration = victoryPopupData
    trackVictoryContinue(rounds.length, players.length)
    trackGameEnd({
      endType: victoryEndedManually ? 'manual' : 'winning_score',
      roundCount: rounds.length,
      playerCount: players.length,
      winnerCount: celebration?.winners.length ?? 0,
      winningScore: celebration?.targetScore,
    })
    closeVictoryPopup()
    setGameEnded(true)
    setShowConfetti(true)
    if (confettiTimerRef.current !== null) {
      window.clearTimeout(confettiTimerRef.current)
    }
    confettiTimerRef.current = window.setTimeout(() => {
      setShowConfetti(false)
      confettiTimerRef.current = null
    }, 2200)
  }

  const clearRoundInputs = () => {
    setRoundInputs(emptyRoundInputs(players))
  }

  const handleStartGame = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedNames = playerNames.map((name) => name.trim())
    if (trimmedNames.length < MIN_PLAYERS) {
      setSetupError(t.minPlayersError)
      return
    }
    if (trimmedNames.some((name) => name.length === 0)) {
      setSetupError(t.emptyNameError)
      return
    }
    const normalizedNames = trimmedNames.map((name) => name.toLocaleLowerCase())
    if (new Set(normalizedNames).size !== normalizedNames.length) {
      setSetupError(t.duplicateNameError)
      return
    }

    const initial = Number(startingScore)
    if (!Number.isFinite(initial)) {
      return
    }

    let parsedWinningScore: number | null = null
    if (winningScoreInput.trim()) {
      const parsed = Number(winningScoreInput)
      if (!Number.isFinite(parsed)) {
        return
      }
      parsedWinningScore = parsed
    }

    trackGameStart({
      playerCount: trimmedNames.length,
      startingScore: initial,
      hasWinningScore: parsedWinningScore !== null,
      winningScore: parsedWinningScore ?? undefined,
    })
    startGame(trimmedNames, initial, parsedWinningScore)
    setSetupError('')
    setAutoEndedByWinningScore(false)
    closeVictoryPopup()
    setCopyStatus('')
    setRoundInputs(
      trimmedNames.reduce<Record<string, string>>((acc, _, index) => {
        acc[`player-${index + 1}`] = ''
        return acc
      }, {}),
    )
  }

  const handleAddRound = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const deltas = normalizeRoundInput(players, roundInputs)
    const nextScores = simulateScoresAfterAdd(players, deltas)
    addRound(deltas)

    const affectedIds = new Set(Object.keys(deltas).filter((id) => deltas[id] !== 0))
    setUpdatedPlayerIds(affectedIds)
    setTimeout(() => setUpdatedPlayerIds(new Set()), 600)

    trackRoundAdd(rounds.length + 1, players.length)
    if (reachesWinningScore(nextScores, winningScore)) {
      const celebration = buildThresholdCelebration(nextScores)
      if (celebration) {
        openVictoryPopup(celebration, false)
      }
    }
    clearRoundInputs()
  }

  const handleEditLastRound = () => {
    const deltas = normalizeRoundInput(players, roundInputs)
    const nextScores = simulateScoresAfterEditLast(players, rounds, deltas)
    trackRoundEditLast(rounds.length, players.length)
    updateLastRound(deltas)
    if (reachesWinningScore(nextScores, winningScore)) {
      const celebration = buildThresholdCelebration(nextScores)
      if (celebration) {
        openVictoryPopup(celebration, false)
      }
    }
    clearRoundInputs()
  }

  const handleDeleteLastRound = () => {
    deleteLastRound()
    trackRoundDeleteLast(Math.max(0, rounds.length - 1), players.length)
  }

  const handleEndGame = () => {
    if (rounds.length === 0) {
      return
    }

    let celebration: VictoryCelebration | null = null
    if (winningScore !== null && winners.length > 0) {
      celebration = { winners, targetScore: winningScore }
    } else {
      const leaders = leadersAtTop(sortedPlayers)
      if (leaders.length > 0) {
        celebration = {
          winners: leaders,
          targetScore: winningScore ?? leaders[0].score,
        }
      }
    }

    if (celebration) {
      openVictoryPopup(celebration, true)
      setCopyStatus('')
      return
    }

    trackGameEnd({
      endType: 'manual',
      roundCount: rounds.length,
      playerCount: players.length,
    })
    setAutoEndedByWinningScore(false)
    closeVictoryPopup()
    setShowConfetti(false)
    setGameEnded(true)
    setCopyStatus('')
  }

  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopyStatus(t.copied)
      trackShareResult(true)
    } catch {
      setCopyStatus(t.copyFailed)
      trackShareResult(false)
    }
  }

  const handleLanguageChange = (next: Language) => {
    if (next !== language) {
      trackLanguageChange(next)
    }
    setLanguage(next)
  }

  const addPlayerField = () => {
    if (playerNames.length >= 16) {
      return
    }
    shouldFocusNewPlayerRef.current = true
    setPlayerNames((prev) => {
      const next = [...prev, '']
      trackSetupPlayerChange('add', next.length)
      return next
    })
    setSetupError('')
  }

  const removePlayerField = () => {
    if (playerNames.length <= MIN_PLAYERS) {
      setSetupError(t.minPlayersError)
      return
    }
    setPlayerNames((prev) => {
      const next = prev.slice(0, -1)
      trackSetupPlayerChange('remove', next.length)
      return next
    })
    setSetupError('')
  }

  const updatePlayerName = (index: number, value: string) => {
    setPlayerNames((prev) => prev.map((item, itemIndex) => (itemIndex === index ? value : item)))
    if (setupError) {
      setSetupError('')
    }
  }

  useEffect(() => {
    if (!shouldFocusNewPlayerRef.current) {
      return
    }
    const lastIndex = playerNames.length - 1
    const targetInput = playerInputRefs.current[lastIndex]
    targetInput?.focus()
    shouldFocusNewPlayerRef.current = false
  }, [playerNames.length])

  const handleResetGame = () => {
    trackGameReset(gameEnded ? 'summary' : 'match')
    setAutoEndedByWinningScore(false)
    setShowConfetti(false)
    closeVictoryPopup()
    if (confettiTimerRef.current !== null) {
      window.clearTimeout(confettiTimerRef.current)
      confettiTimerRef.current = null
    }
    setCopyStatus('')
    setWinningScoreInput('')
    resetGame()
  }

  const handleCreateRoom = async () => {
    setRoomLinkStatus('')
    await createRoom()
  }

  const handleJoinRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = joinCodeInput.trim().toUpperCase()
    if (!code) return
    const joined = await joinRoom(code)
    setJoinRoomError(joined ? '' : t.joinRoomError)
  }

  const handleCopyRoomLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setRoomLinkStatus(t.roomLinkCopied)
    } catch {
      setRoomLinkStatus(t.copyFailed)
    }
  }

  const handleLeaveRoom = () => {
    leaveRoom()
    setJoinCodeInput('')
    setJoinRoomError('')
  }

  return (
    <main className={`app-shell ${transitionStage === 'entering' ? 'page-transition' : ''}`}>
      {showVictoryPopup && !gameEnded && victoryPopupData ? (
        <VictoryPopup
          t={t}
          winners={victoryPopupData.winners}
          winningScore={victoryPopupData.targetScore}
          onContinue={handleVictoryContinue}
        />
      ) : null}

      <AppHeader t={t} language={language} onLanguageChange={handleLanguageChange} />

      {readOnly ? (
        <div className="room-bar">
          <div className="room-bar-info">
            <span className="room-status">
              <span
                className={`room-status-dot${syncStatus === 'error' ? ' is-error' : ''}`}
                aria-hidden="true"
              />
              {t.liveSyncLabel}
              <span className="room-code-pill">{roomCode ?? ''}</span>
            </span>
            {syncStatus === 'error' ? <span className="sync-error-banner">{t.syncErrorNotice}</span> : null}
          </div>
          <div className="room-bar-actions">
            <button type="button" className="button ghost" onClick={handleLeaveRoom}>
              {t.leaveRoom}
            </button>
          </div>
        </div>
      ) : null}

      {!gameStarted ? (
        <>
          {!roomCode ? (
            <form onSubmit={handleJoinRoom} className="join-room-bar">
              <label className="field">
                <span className="micro-label">{t.joinRoomLabel}</span>
                <div className="field-inline">
                  <input
                    type="text"
                    placeholder={t.joinRoomPlaceholder}
                    value={joinCodeInput}
                    onChange={(event) => {
                      setJoinCodeInput(event.target.value)
                      setJoinRoomError('')
                    }}
                  />
                  <button type="submit" className="button ghost">
                    {t.joinRoomButton}
                  </button>
                </div>
              </label>
              {joinRoomError ? <p className="form-error">{joinRoomError}</p> : null}
            </form>
          ) : null}
        <Setup
          t={t}
          startingScore={startingScore}
          winningScoreInput={winningScoreInput}
          playerNames={playerNames}
          setupError={setupError}
          playerInputRefs={playerInputRefs}
          onStartingScoreChange={setStartingScore}
          onStartingScoreFocus={() => {
            if (startingScore === '0') {
              setStartingScore('')
            }
          }}
          onStartingScoreBlur={() => {
            if (startingScore.trim() === '') {
              setStartingScore('0')
            }
          }}
          onWinningScoreInputChange={setWinningScoreInput}
          onPlayerNameChange={updatePlayerName}
          onAddPlayer={addPlayerField}
          onRemovePlayer={removePlayerField}
          onSubmit={handleStartGame}
        />
        </>
      ) : gameEnded ? (
        <Summary
          t={t}
          sortedPlayers={sortedPlayers}
          playerStats={playerStats}
          roundsCount={rounds.length}
          winners={winners}
          autoEndedByWinningScore={autoEndedByWinningScore}
          showConfetti={showConfetti}
          shareText={shareText}
          copyStatus={copyStatus}
          readOnly={readOnly}
          onBackToMatch={() => {
            trackSummaryBackToMatch(rounds.length)
            setGameEnded(false)
          }}
          onResetGame={handleResetGame}
          onCopyResult={handleCopyResult}
        />
      ) : (
        <>
          {winnerNotice ? <p className="winner-notice animate-pop">{winnerNotice}</p> : null}
          <section className={`content-grid${readOnly ? ' single' : ''}`}>
          {!readOnly ? (
            <ScoreInput
              t={t}
              players={players}
              roundInputs={roundInputs}
              roundCount={rounds.length}
              roomCode={roomCode}
              syncStatus={syncStatus}
              roomLinkStatus={roomLinkStatus}
              onCreateRoom={handleCreateRoom}
              onCopyRoomLink={handleCopyRoomLink}
              onRoundInputChange={(playerId, value) =>
                setRoundInputs((prev) => ({ ...prev, [playerId]: value }))
              }
              onRoundInputFocus={(playerId) => {
                if ((roundInputs[playerId] ?? '') === '0') {
                  setRoundInputs((prev) => ({ ...prev, [playerId]: '' }))
                }
              }}
              onSubmit={handleAddRound}
              onEditLastRound={handleEditLastRound}
              onEndGame={handleEndGame}
              onDeleteLastRound={handleDeleteLastRound}
              onResetGame={handleResetGame}
            />
          ) : null}
          <Ranking
            t={t}
            variant="live"
            sortedPlayers={sortedPlayers}
            leaderScore={leaderScore}
            updatedPlayerIds={updatedPlayerIds}
          />
          </section>
        </>
      )}
    </main>
  )
}

export default App
