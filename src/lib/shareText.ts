import type { CopyStrings } from './copy'
import type { Player, PlayerStats } from '../types'

export function buildShareText(
  t: CopyStrings,
  sortedPlayers: Player[],
  playerStats: Record<string, PlayerStats>,
  roundCount: number,
  winningScore: number | null,
): string {
  const lines = [
    t.shareTitle,
    t.sharePlayerCount(sortedPlayers.length),
    t.shareRoundCount(roundCount),
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
}
