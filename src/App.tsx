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
import type { Language } from './types'

function App() {
  const { gameStarted, players, rounds, startGame, addRound, updateLastRound, deleteLastRound, resetGame } =
    useGameStore()

  const [startingScore, setStartingScore] = useState('0')
  const [winningScoreInput, setWinningScoreInput] = useState('')
  const [playerNames, setPlayerNames] = useState(['', ''])
  const [roundInputs, setRoundInputs] = useState<Record<string, string>>({})
  const [gameEnded, setGameEnded] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [winningScore, setWinningScore] = useState<number | null>(null)
  const [autoEndedByWinningScore, setAutoEndedByWinningScore] = useState(false)
  const [language, setLanguage] = useState<Language>('vi')
  const [showConfetti, setShowConfetti] = useState(false)
  const [showVictoryPopup, setShowVictoryPopup] = useState(false)
  const [setupError, setSetupError] = useState('')
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

  const triggerWinCelebration = (scoresAfterRound?: number[]) => {
    setAutoEndedByWinningScore(true)
    setShowVictoryPopup(true)
    if (winningScore !== null) {
      const scores = scoresAfterRound ?? players.map((player) => player.score)
      const winnerCount = scores.filter((score) => score >= winningScore).length
      trackVictoryPopupView(winnerCount, winningScore)
    }
  }

  const handleVictoryContinue = () => {
    trackVictoryContinue(rounds.length, players.length)
    trackGameEnd({
      endType: 'winning_score',
      roundCount: rounds.length,
      playerCount: players.length,
      winnerCount: winners.length,
      winningScore: winningScore ?? undefined,
    })
    setShowVictoryPopup(false)
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
      setWinningScore(parsed)
    } else {
      setWinningScore(null)
    }

    trackGameStart({
      playerCount: trimmedNames.length,
      startingScore: initial,
      hasWinningScore: parsedWinningScore !== null,
      winningScore: parsedWinningScore ?? undefined,
    })
    startGame(trimmedNames, initial)
    setSetupError('')
    setGameEnded(false)
    setAutoEndedByWinningScore(false)
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
      triggerWinCelebration(nextScores)
    }
    clearRoundInputs()
  }

  const handleEditLastRound = () => {
    const deltas = normalizeRoundInput(players, roundInputs)
    const nextScores = simulateScoresAfterEditLast(players, rounds, deltas)
    trackRoundEditLast(rounds.length, players.length)
    updateLastRound(deltas)
    if (reachesWinningScore(nextScores, winningScore)) {
      triggerWinCelebration(nextScores)
    }
    clearRoundInputs()
  }

  const handleDeleteLastRound = () => {
    deleteLastRound()
    trackRoundDeleteLast(Math.max(0, rounds.length - 1), players.length)
  }

  const handleEndGame = () => {
    trackGameEnd({
      endType: 'manual',
      roundCount: rounds.length,
      playerCount: players.length,
    })
    setAutoEndedByWinningScore(false)
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
    setGameEnded(false)
    setAutoEndedByWinningScore(false)
    setShowConfetti(false)
    setShowVictoryPopup(false)
    if (confettiTimerRef.current !== null) {
      window.clearTimeout(confettiTimerRef.current)
      confettiTimerRef.current = null
    }
    setCopyStatus('')
    setWinningScore(null)
    setWinningScoreInput('')
    resetGame()
  }

  return (
    <main className={`app-shell ${transitionStage === 'entering' ? 'page-transition' : ''}`}>
      {showVictoryPopup && winningScore !== null && winners.length > 0 ? (
        <VictoryPopup
          t={t}
          winners={winners}
          winningScore={winningScore}
          onContinue={handleVictoryContinue}
        />
      ) : null}

      <AppHeader t={t} language={language} onLanguageChange={handleLanguageChange} />

      {!gameStarted ? (
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
          onBackToMatch={() => {
            trackSummaryBackToMatch(rounds.length)
            setGameEnded(false)
          }}
          onResetGame={handleResetGame}
          onCopyResult={handleCopyResult}
        />
      ) : (
        <section className="content-grid">
          <ScoreInput
            t={t}
            players={players}
            roundInputs={roundInputs}
            roundCount={rounds.length}
            winnerNotice={winnerNotice}
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
          <Ranking
            t={t}
            variant="live"
            sortedPlayers={sortedPlayers}
            leaderScore={leaderScore}
            updatedPlayerIds={updatedPlayerIds}
          />
        </section>
      )}
    </main>
  )
}

export default App
