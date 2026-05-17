import type { CopyStrings } from '../lib/copy'
import type { Player, PlayerStats } from '../types'

type RankingVariant = 'live' | 'summary'

type RankingProps = {
  t: CopyStrings
  variant: RankingVariant
  sortedPlayers: Player[]
  leaderScore?: number
  playerStats?: Record<string, PlayerStats>
  updatedPlayerIds?: Set<string>
  showHeading?: boolean
}

export function Ranking({
  t,
  variant,
  sortedPlayers,
  leaderScore,
  playerStats,
  updatedPlayerIds,
  showHeading = true,
}: RankingProps) {
  return (
    <article className={variant === 'live' ? 'panel' : undefined}>
      {showHeading ? <h2 className="type-subheading">{t.rankingHeading}</h2> : null}
      <ul className="ranking">
        {sortedPlayers.map((player, index) => {
          const isTop = index === 0
          const isLeader = player.score === leaderScore
          const rowClass = [
            'rank-row',
            isTop ? 'top-one' : '',
            isLeader && !isTop ? 'leader' : '',
            variant === 'live' && updatedPlayerIds?.has(player.id) ? 'score-updated' : '',
          ]
            .filter(Boolean)
            .join(' ')

          if (variant === 'summary' && playerStats) {
            const stats = playerStats[player.id]
            const highest = Number.isFinite(stats.highestRound) ? stats.highestRound : 0
            const lowest = Number.isFinite(stats.lowestRound) ? stats.lowestRound : 0

            return (
              <li key={player.id} className={rowClass}>
                <div className="stack compact">
                  <strong className="type-card-title rank-title-row">
                    <span className="rank-badge">{t.rankLabel(index)}</span>
                    <span>
                      {isTop ? '🏆 ' : ''}
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
          }

          return (
            <li key={player.id} className={rowClass}>
              <span>
                {isTop ? '🏆 ' : ''}#{index + 1}{' '}
                <span className="emoji-inline-badge">{player.emoji}</span> {player.name}
              </span>
              <strong className="type-score-value">{player.score}</strong>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
