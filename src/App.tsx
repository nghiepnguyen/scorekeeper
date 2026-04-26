import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useGameStore } from './store/gameStore'

type PlayerStats = {
  playerId: string
  wins: number
  losses: number
  draws: number
  highestRound: number
  lowestRound: number
}

type Language = 'vi' | 'en'
const PREVIEW_EMOJIS = ['🐯', '🦊', '🐼', '🐸', '🦁', '🐨', '🐵', '🐙', '🦄', '🐧', '🐻', '🐺']

const copy = {
  vi: {
    title: 'Bảng điểm cho nhóm chơi',
    subtitle: 'Theo dõi điểm từng ván, sắp xếp hạng realtime và sửa nhanh ván vừa nhập.',
    setupHeading: 'Thiết lập phòng',
    startingScore: 'Điểm khởi tạo',
    winningScore: 'Điểm chiến thắng (tùy chọn)',
    winningScorePlaceholder: 'Ví dụ: 100',
    players: 'Người chơi',
    playerPlaceholder: (index: number) => `Người chơi ${index + 1}`,
    duplicateNameError: 'Tên người chơi không được trùng nhau.',
    emptyNameError: 'Vui lòng nhập tên cho tất cả người chơi.',
    minPlayersError: 'Cần ít nhất 2 người chơi.',
    addPlayer: '+ Thêm người',
    removePlayer: '- Bớt người',
    startGame: 'Bắt đầu phòng chơi',
    endMatch: 'Kết thúc trận',
    autoWinTitle: '🎉 Đã có người chạm mốc chiến thắng!',
    summaryTitle: 'Kết quả tổng kết',
    backToMatch: 'Quay lại trận đấu',
    totalRounds: 'Tổng số ván',
    wld: 'Thắng/Thua/Hòa',
    highestLowest: 'Ván cao nhất: {highest} | Ván thấp nhất: {lowest}',
    copyResult: 'Copy kết quả text',
    newRoom: 'Tạo phòng mới',
    shareTextLabel: 'Bản sao để chia sẻ',
    scoreInputHeading: 'Nhập điểm từng ván',
    rankingHeading: 'Bảng xếp hạng',
    saveRound: 'Lưu ván mới',
    editLastRound: 'Sửa ván cuối',
    endGame: 'Kết thúc game',
    deleteLastRound: 'Xóa ván cuối',
    playedRounds: (count: number) => `Đã chơi ${count} ván.`,
    copied: 'Đã copy kết quả.',
    copyFailed: 'Không copy được. Hãy copy thủ công từ khung text bên dưới.',
    winnerSingle: (name: string, score: number) => `🎉 ${name} đã đạt mốc chiến thắng ${score} điểm!`,
    winnerMulti: (count: number, names: string, score: number) =>
      `🏆 Đã có ${count} người đạt mốc ${score} điểm: ${names}`,
    rankLabel: (index: number) => `Hạng ${index + 1}`,
    shareTitle: 'SCOREKEEPER - KẾT QUẢ CHUNG CUỘC',
    sharePlayerCount: (count: number) => `Số người chơi: ${count}`,
    shareRoundCount: (count: number) => `Số ván: ${count}`,
    shareWinScore: (score: number | null) =>
      score !== null ? `Điểm chiến thắng: ${score}` : 'Điểm chiến thắng: Không đặt',
    shareRanking: 'XẾP HẠNG:',
    shareLine: (rank: string, name: string, score: number, w: number, l: number, d: number, hi: number, lo: number) =>
      `${rank} - ${name}: ${score} điểm | Thắng/Thua/Hòa ${w}/${l}/${d} | Cao nhất ${hi}, Thấp nhất ${lo}`,
  },
  en: {
    title: 'Scoreboard for Group Games',
    subtitle: 'Track round scores, view live rankings, and quickly fix the latest round.',
    setupHeading: 'Room Setup',
    startingScore: 'Starting score',
    winningScore: 'Winning score (optional)',
    winningScorePlaceholder: 'Example: 100',
    players: 'Players',
    playerPlaceholder: (index: number) => `Player ${index + 1}`,
    duplicateNameError: 'Player names must be unique.',
    emptyNameError: 'Please enter all player names.',
    minPlayersError: 'At least 2 players are required.',
    addPlayer: '+ Add player',
    removePlayer: '- Remove player',
    startGame: 'Start game room',
    endMatch: 'Match finished',
    autoWinTitle: '🎉 Someone reached the winning score!',
    summaryTitle: 'Game summary',
    backToMatch: 'Back to match',
    totalRounds: 'Total rounds',
    wld: 'Win/Loss/Draw',
    highestLowest: 'Highest round: {highest} | Lowest round: {lowest}',
    copyResult: 'Copy result text',
    newRoom: 'Create new room',
    shareTextLabel: 'Share-ready text',
    scoreInputHeading: 'Enter round scores',
    rankingHeading: 'Leaderboard',
    saveRound: 'Save new round',
    editLastRound: 'Edit last round',
    endGame: 'End game',
    deleteLastRound: 'Delete last round',
    playedRounds: (count: number) => `${count} rounds played.`,
    copied: 'Result copied.',
    copyFailed: 'Could not copy. Please copy manually from the text area below.',
    winnerSingle: (name: string, score: number) => `🎉 ${name} reached the winning score of ${score}!`,
    winnerMulti: (count: number, names: string, score: number) =>
      `🏆 ${count} players reached the winning score of ${score}: ${names}`,
    rankLabel: (index: number) => `Rank ${index + 1}`,
    shareTitle: 'SCOREKEEPER - FINAL RESULTS',
    sharePlayerCount: (count: number) => `Players: ${count}`,
    shareRoundCount: (count: number) => `Rounds: ${count}`,
    shareWinScore: (score: number | null) =>
      score !== null ? `Winning score: ${score}` : 'Winning score: Not set',
    shareRanking: 'RANKING:',
    shareLine: (rank: string, name: string, score: number, w: number, l: number, d: number, hi: number, lo: number) =>
      `${rank} - ${name}: ${score} pts | W/L/D ${w}/${l}/${d} | Highest ${hi}, Lowest ${lo}`,
  },
}

function App() {
  const {
    gameStarted,
    players,
    rounds,
    startGame,
    addRound,
    updateLastRound,
    deleteLastRound,
    resetGame,
  } = useGameStore()

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
  const [setupError, setSetupError] = useState('')
  const confettiTimerRef = useRef<number | null>(null)
  const playerInputRefs = useRef<Array<HTMLInputElement | null>>([])
  const shouldFocusNewPlayerRef = useRef(false)
  const t = copy[language]

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    [players],
  )

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

  const playerStats = useMemo<Record<string, PlayerStats>>(() => {
    const initialStats = players.reduce<Record<string, PlayerStats>>((acc, player) => {
      acc[player.id] = {
        playerId: player.id,
        wins: 0,
        losses: 0,
        draws: 0,
        highestRound: Number.NEGATIVE_INFINITY,
        lowestRound: Number.POSITIVE_INFINITY,
      }
      return acc
    }, {})

    rounds.forEach((round) => {
      const values = players.map((player) => round.deltas[player.id] ?? 0)
      const maxDelta = Math.max(...values)
      const minDelta = Math.min(...values)

      players.forEach((player) => {
        const delta = round.deltas[player.id] ?? 0
        const current = initialStats[player.id]

        current.highestRound = Math.max(current.highestRound, delta)
        current.lowestRound = Math.min(current.lowestRound, delta)

        if (delta === maxDelta && delta !== minDelta) {
          current.wins += 1
          return
        }
        if (delta === minDelta && delta !== maxDelta) {
          current.losses += 1
          return
        }
        current.draws += 1
      })
    })

    return initialStats
  }, [players, rounds])

  const shareText = useMemo(() => {
    const lines = [
      t.shareTitle,
      t.sharePlayerCount(players.length),
      t.shareRoundCount(rounds.length),
      t.shareWinScore(winningScore),
      '',
      t.shareRanking,
      ...sortedPlayers.map((player, index) => {
        const stats = playerStats[player.id]
        const highest = Number.isFinite(stats.highestRound) ? stats.highestRound : 0
        const lowest = Number.isFinite(stats.lowestRound) ? stats.lowestRound : 0
        return t.shareLine(
          t.rankLabel(index),
          `${player.emoji} ${player.name}`,
          player.score,
          stats.wins,
          stats.losses,
          stats.draws,
          highest,
          lowest,
        )
      }),
    ]
    return lines.join('\n')
  }, [playerStats, players.length, rounds.length, sortedPlayers, t, winningScore])

  const normalizeRoundInput = () =>
    players.reduce<Record<string, number>>((acc, player) => {
      const value = Number(roundInputs[player.id] ?? 0)
      acc[player.id] = Number.isFinite(value) ? value : 0
      return acc
    }, {})

  const reachesWinningScore = (scores: number[]) => {
    if (winningScore === null) {
      return false
    }
    return scores.some((score) => score >= winningScore)
  }

  const simulateScoresAfterAdd = (deltas: Record<string, number>) =>
    players.map((player) => player.score + (deltas[player.id] ?? 0))

  const simulateScoresAfterEditLast = (deltas: Record<string, number>) => {
    if (!rounds.length) {
      return players.map((player) => player.score)
    }
    const lastRound = rounds[rounds.length - 1]
    return players.map(
      (player) =>
        player.score - (lastRound.deltas[player.id] ?? 0) + (deltas[player.id] ?? 0),
    )
  }

  const clearRoundInputs = () => {
    setRoundInputs(
      players.reduce<Record<string, string>>((acc, player) => {
        acc[player.id] = ''
        return acc
      }, {}),
    )
  }

  const handleStartGame = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedNames = playerNames.map((name) => name.trim())
    if (trimmedNames.length < 2) {
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
    const cleanedNames = trimmedNames

    const initial = Number(startingScore)
    if (!Number.isFinite(initial)) {
      return
    }

    if (winningScoreInput.trim()) {
      const parsedWinningScore = Number(winningScoreInput)
      if (!Number.isFinite(parsedWinningScore)) {
        return
      }
      setWinningScore(parsedWinningScore)
    } else {
      setWinningScore(null)
    }

    startGame(cleanedNames, initial)
    setSetupError('')
    setGameEnded(false)
    setAutoEndedByWinningScore(false)
    setCopyStatus('')
    setRoundInputs(
      cleanedNames.reduce<Record<string, string>>((acc, _, index) => {
        acc[`player-${index + 1}`] = ''
        return acc
      }, {}),
    )
  }

  const handleAddRound = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const deltas = normalizeRoundInput()
    const nextScores = simulateScoresAfterAdd(deltas)
    addRound(deltas)
    if (reachesWinningScore(nextScores)) {
      setAutoEndedByWinningScore(true)
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
    clearRoundInputs()
  }

  const handleEditLastRound = () => {
    const deltas = normalizeRoundInput()
    const nextScores = simulateScoresAfterEditLast(deltas)
    updateLastRound(deltas)
    if (reachesWinningScore(nextScores)) {
      setAutoEndedByWinningScore(true)
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
    clearRoundInputs()
  }

  const handleDeleteLastRound = () => {
    deleteLastRound()
  }

  const handleEndGame = () => {
    setAutoEndedByWinningScore(false)
    setGameEnded(true)
    setCopyStatus('')
  }

  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopyStatus(t.copied)
    } catch {
      setCopyStatus(t.copyFailed)
    }
  }

  const addPlayerField = () => {
    if (playerNames.length >= 8) {
      return
    }
    shouldFocusNewPlayerRef.current = true
    setPlayerNames((prev) => [...prev, ''])
    setSetupError('')
  }

  const removePlayerField = () => {
    if (playerNames.length <= 2) {
      setSetupError(t.minPlayersError)
      return
    }
    setPlayerNames((prev) => prev.slice(0, -1))
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
    setGameEnded(false)
    setAutoEndedByWinningScore(false)
    setShowConfetti(false)
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
    <main className="app-shell">
      <header className="panel app-header">
        <div className="header-main">
          <div>
            <p className="micro-label">ScoreKeeper</p>
            <h1 className="header-title">{t.title}</h1>
          </div>
          <div className="inline-actions lang-switch">
            <button
              type="button"
              className={language === 'vi' ? 'button primary' : 'button ghost'}
              onClick={() => setLanguage('vi')}
            >
              VI
            </button>
            <button
              type="button"
              className={language === 'en' ? 'button primary' : 'button ghost'}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
          </div>
        </div>
        <p className="subtle header-subtitle">{t.subtitle}</p>
      </header>

      {!gameStarted ? (
        <section className="panel">
          <h2 className="type-section-heading">{t.setupHeading}</h2>
          <form onSubmit={handleStartGame} className="stack">
            <div className="field-row">
              <label className="field">
                <span>{t.startingScore}</span>
                <input
                  type="number"
                  value={startingScore}
                  onChange={(event) => setStartingScore(event.target.value)}
                  onFocus={() => {
                    if (startingScore === '0') {
                      setStartingScore('')
                    }
                  }}
                  onBlur={() => {
                    if (startingScore.trim() === '') {
                      setStartingScore('0')
                    }
                  }}
                />
              </label>
              <label className="field">
                <span>{t.winningScore}</span>
                <input
                  type="number"
                  placeholder={t.winningScorePlaceholder}
                  value={winningScoreInput}
                  onChange={(event) => setWinningScoreInput(event.target.value)}
                />
              </label>
            </div>

            <div className="stack">
              <span>{t.players} ({playerNames.length}/8)</span>
              {playerNames.map((name, index) => (
                <div key={index} className="player-name-row">
                  <span className="player-emoji-badge">{PREVIEW_EMOJIS[index % PREVIEW_EMOJIS.length]}</span>
                  <input
                    type="text"
                    placeholder={t.playerPlaceholder(index)}
                    value={name}
                    ref={(element) => {
                      playerInputRefs.current[index] = element
                    }}
                    onChange={(event) => updatePlayerName(index, event.target.value)}
                  />
                </div>
              ))}
              <div className="inline-actions player-actions">
                <button type="button" className="button success" onClick={addPlayerField}>
                  {t.addPlayer}
                </button>
                <button type="button" className="button danger" onClick={removePlayerField}>
                  {t.removePlayer}
                </button>
              </div>
              {setupError ? <p className="form-error">{setupError}</p> : null}
            </div>

            <button type="submit" className="button primary">
              {t.startGame}
            </button>
          </form>
        </section>
      ) : gameEnded ? (
        <section className="panel stack">
          {showConfetti ? (
            <div className="confetti-layer" aria-hidden="true">
              {Array.from({ length: 22 }).map((_, index) => (
                <span key={index} className="confetti-piece" />
              ))}
            </div>
          ) : null}
          <div className={autoEndedByWinningScore ? 'result-hero winner' : 'result-hero'}>
            <p className="micro-label">{t.endMatch}</p>
            <h2 className="type-section-heading">
              {autoEndedByWinningScore ? t.autoWinTitle : t.summaryTitle}
            </h2>
            {autoEndedByWinningScore && winners.length > 0 ? (
              <p className="result-hero-winners">
                {winners.map((player, index) => (
                  <span key={player.id}>
                    <span className="emoji-inline-badge">{player.emoji}</span> {player.name}
                    {index < winners.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            ) : null}
          </div>
          <div className="title-row">
            <div className="inline-actions">
              <button type="button" className="button secondary" onClick={() => setGameEnded(false)}>
                {t.backToMatch}
              </button>
              <button type="button" className="button primary" onClick={handleResetGame}>
                {t.newRoom}
              </button>
            </div>
          </div>

          {sortedPlayers[0] ? (
            <article className="champion-card">
              <p className="micro-label">Champion</p>
              <h3 className="champion-name">
                🏆 <span className="emoji-inline-badge emoji-inline-badge-lg">{sortedPlayers[0].emoji}</span>{' '}
                {sortedPlayers[0].name}
              </h3>
              <p className="champion-score">{sortedPlayers[0].score}</p>
            </article>
          ) : null}

          <p className="subtle">
            {t.totalRounds}: <strong>{rounds.length}</strong>
          </p>

          <ul className="ranking">
            {sortedPlayers.map((player, index) => {
              const stats = playerStats[player.id]
              const highest = Number.isFinite(stats.highestRound) ? stats.highestRound : 0
              const lowest = Number.isFinite(stats.lowestRound) ? stats.lowestRound : 0

              return (
                <li
                  key={player.id}
                  className={index === 0 ? 'rank-row leader top-one' : 'rank-row'}
                >
                  <div className="stack compact">
                    <strong className="type-card-title rank-title-row">
                      <span className="rank-badge">{t.rankLabel(index)}</span>
                      <span>
                        {index === 0 ? '🏆 ' : ''}
                        <span className="emoji-inline-badge">{player.emoji}</span> {player.name}
                      </span>
                    </strong>
                    <span className="subtle stat-chip">
                      {t.wld}: {stats.wins}/{stats.losses}/{stats.draws}
                    </span>
                    <span className="subtle stat-chip">
                      {t.highestLowest.replace('{highest}', String(highest)).replace('{lowest}', String(lowest))}
                    </span>
                  </div>
                  <strong className="type-score-value">{player.score}</strong>
                </li>
              )
            })}
          </ul>

          <div className="inline-actions">
            <button type="button" className="button primary" onClick={handleCopyResult}>
              {t.copyResult}
            </button>
          </div>
          {copyStatus ? <p className="subtle">{copyStatus}</p> : null}

          <label className="field">
            <span>{t.shareTextLabel}</span>
            <textarea readOnly value={shareText} rows={8} />
          </label>
        </section>
      ) : (
        <section className="content-grid">
          <article className="panel">
            {winnerNotice ? <p className="winner-notice animate-pop">{winnerNotice}</p> : null}
            <div className="title-row">
              <h2 className="type-subheading">{t.scoreInputHeading}</h2>
              <button type="button" className="button ghost" onClick={handleResetGame}>
                {t.newRoom}
              </button>
            </div>

            <form onSubmit={handleAddRound} className="stack">
              {players.map((player) => (
                <label key={player.id} className="field">
                  <span>
                    <span className="emoji-inline-badge">{player.emoji}</span> {player.name}
                  </span>
                  <input
                    type="number"
                    placeholder="0"
                    value={roundInputs[player.id] ?? ''}
                    onChange={(event) =>
                      setRoundInputs((prev) => ({
                        ...prev,
                        [player.id]: event.target.value,
                      }))
                    }
                    onFocus={() => {
                      if ((roundInputs[player.id] ?? '') === '0') {
                        setRoundInputs((prev) => ({
                          ...prev,
                          [player.id]: '',
                        }))
                      }
                    }}
                  />
                </label>
              ))}
              <div className="inline-actions">
                <button type="submit" className="button primary">
                  {t.saveRound}
                </button>
                <button
                  type="button"
                  className="button ghost"
                  onClick={handleEditLastRound}
                  disabled={!rounds.length}
                >
                  {t.editLastRound}
                </button>
                <button
                  type="button"
                  className="button primary"
                  onClick={handleEndGame}
                  disabled={!rounds.length}
                >
                  {t.endGame}
                </button>
                <button
                  type="button"
                  className="button ghost"
                  onClick={handleDeleteLastRound}
                  disabled={!rounds.length}
                >
                  {t.deleteLastRound}
                </button>
              </div>
            </form>
            <p className="subtle">{t.playedRounds(rounds.length)}</p>
          </article>

          <article className="panel">
            <h2 className="type-subheading">{t.rankingHeading}</h2>
            <ul className="ranking">
              {sortedPlayers.map((player, index) => (
                <li
                  key={player.id}
                  className={
                    index === 0
                      ? 'rank-row leader top-one'
                      : player.score === leaderScore
                        ? 'rank-row leader'
                        : 'rank-row'
                  }
                >
                  <span>
                    {index === 0 ? '🏆 ' : ''}#{index + 1}{' '}
                    <span className="emoji-inline-badge">{player.emoji}</span> {player.name}
                  </span>
                  <strong>{player.score}</strong>
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}
    </main>
  )
}

export default App
