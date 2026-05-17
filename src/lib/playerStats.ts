import type { Player, PlayerStats, Round } from '../types'

export function computePlayerStats(players: Player[], rounds: Round[]): Record<string, PlayerStats> {
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
}
