import type { Player, Round } from '../types'

export function normalizeRoundInput(
  players: Player[],
  roundInputs: Record<string, string>,
): Record<string, number> {
  return players.reduce<Record<string, number>>((acc, player) => {
    const value = Number(roundInputs[player.id] ?? 0)
    acc[player.id] = Number.isFinite(value) ? value : 0
    return acc
  }, {})
}

export function emptyRoundInputs(players: Player[]): Record<string, string> {
  return players.reduce<Record<string, string>>((acc, player) => {
    acc[player.id] = ''
    return acc
  }, {})
}

export function reachesWinningScore(scores: number[], winningScore: number | null): boolean {
  if (winningScore === null) {
    return false
  }
  return scores.some((score) => score >= winningScore)
}

export function simulateScoresAfterAdd(
  players: Player[],
  deltas: Record<string, number>,
): number[] {
  return players.map((player) => player.score + (deltas[player.id] ?? 0))
}

export function simulateScoresAfterEditLast(
  players: Player[],
  rounds: Round[],
  deltas: Record<string, number>,
): number[] {
  if (!rounds.length) {
    return players.map((player) => player.score)
  }
  const lastRound = rounds[rounds.length - 1]
  return players.map(
    (player) => player.score - (lastRound.deltas[player.id] ?? 0) + (deltas[player.id] ?? 0),
  )
}

export function sortPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
}
