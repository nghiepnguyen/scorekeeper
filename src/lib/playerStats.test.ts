import { describe, expect, it } from 'vitest'
import type { Player, Round } from '../types'
import { computePlayerStats } from './playerStats'

const player = (id: string, name: string): Player => ({ id, name, emoji: '🎲', score: 0 })

const round = (deltas: Record<string, number>): Round => ({
  id: crypto.randomUUID(),
  deltas,
  createdAt: 0,
})

describe('computePlayerStats', () => {
  it('returns zeroed stats when there are no rounds', () => {
    const players = [player('p1', 'A'), player('p2', 'B')]
    const stats = computePlayerStats(players, [])
    expect(stats.p1).toEqual({
      playerId: 'p1',
      wins: 0,
      losses: 0,
      draws: 0,
      highestRound: Number.NEGATIVE_INFINITY,
      lowestRound: Number.POSITIVE_INFINITY,
    })
  })

  it('credits the highest delta in a round with a win', () => {
    const players = [player('p1', 'A'), player('p2', 'B')]
    const rounds = [round({ p1: 10, p2: 2 })]
    const stats = computePlayerStats(players, rounds)
    expect(stats.p1.wins).toBe(1)
    expect(stats.p2.losses).toBe(1)
  })

  it('credits the lowest delta in a round with a loss', () => {
    const players = [player('p1', 'A'), player('p2', 'B'), player('p3', 'C')]
    const rounds = [round({ p1: 10, p2: 5, p3: -2 })]
    const stats = computePlayerStats(players, rounds)
    expect(stats.p3.losses).toBe(1)
    expect(stats.p1.wins).toBe(1)
    expect(stats.p2.draws).toBe(1)
  })

  it('counts a draw when all deltas in a round are equal', () => {
    const players = [player('p1', 'A'), player('p2', 'B')]
    const rounds = [round({ p1: 5, p2: 5 })]
    const stats = computePlayerStats(players, rounds)
    expect(stats.p1.draws).toBe(1)
    expect(stats.p2.draws).toBe(1)
    expect(stats.p1.wins).toBe(0)
    expect(stats.p1.losses).toBe(0)
  })

  it('tracks highest and lowest round deltas across multiple rounds', () => {
    const players = [player('p1', 'A'), player('p2', 'B')]
    const rounds = [round({ p1: 10, p2: -5 }), round({ p1: -3, p2: 8 })]
    const stats = computePlayerStats(players, rounds)
    expect(stats.p1.highestRound).toBe(10)
    expect(stats.p1.lowestRound).toBe(-3)
    expect(stats.p2.highestRound).toBe(8)
    expect(stats.p2.lowestRound).toBe(-5)
  })

  it('treats a missing delta for a player in a round as 0', () => {
    const players = [player('p1', 'A'), player('p2', 'B')]
    const rounds = [round({ p1: 10 })]
    const stats = computePlayerStats(players, rounds)
    expect(stats.p2.highestRound).toBe(0)
    expect(stats.p2.losses).toBe(1)
  })
})
