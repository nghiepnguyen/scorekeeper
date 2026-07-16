import type { CopyStrings } from '../lib/copy'
import type { Player, PlayerStats } from '../types'
import { Confetti } from './Confetti'
import { Ranking } from './Ranking'

type SummaryProps = {
  t: CopyStrings
  sortedPlayers: Player[]
  playerStats: Record<string, PlayerStats>
  roundsCount: number
  winners: Player[]
  autoEndedByWinningScore: boolean
  showConfetti: boolean
  shareText: string
  copyStatus: string
  readOnly: boolean
  onBackToMatch: () => void
  onResetGame: () => void
  onCopyResult: () => void
}

export function Summary({
  t,
  sortedPlayers,
  playerStats,
  roundsCount,
  winners,
  autoEndedByWinningScore,
  showConfetti,
  shareText,
  copyStatus,
  readOnly,
  onBackToMatch,
  onResetGame,
  onCopyResult,
}: SummaryProps) {
  const champion = sortedPlayers[0]

  return (
    <section className="panel stack">
      {showConfetti ? <Confetti /> : null}
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
      <div className="title-row summary-actions">
        <button type="button" className="button secondary" onClick={onBackToMatch}>
          {t.backToMatch}
        </button>
        <button type="button" className="button primary" onClick={onResetGame} disabled={readOnly}>
          {t.newRoom}
        </button>
      </div>

      {champion ? (
        <article className="champion-card">
          <p className="micro-label">Champion</p>
          <h3 className="champion-name">
            🏆 <span className="emoji-inline-badge emoji-inline-badge-lg">{champion.emoji}</span>{' '}
            {champion.name}
          </h3>
          <p className="champion-score">{champion.score}</p>
        </article>
      ) : null}

      <p className="subtle">
        {t.totalRounds}: <strong>{roundsCount}</strong>
      </p>

      <Ranking
        t={t}
        variant="summary"
        sortedPlayers={sortedPlayers}
        leaderScore={champion?.score}
        playerStats={playerStats}
        showHeading={false}
      />

      <div className="inline-actions summary-copy-row">
        <button type="button" className="button primary" onClick={onCopyResult}>
          {t.copyResult}
        </button>
      </div>
      {copyStatus ? <p className="subtle">{copyStatus}</p> : null}

      <label className="field share-field">
        <span>{t.shareTextLabel}</span>
        <textarea readOnly value={shareText} rows={6} />
      </label>
    </section>
  )
}
