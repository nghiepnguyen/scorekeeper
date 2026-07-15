import { describe, expect, it } from 'vitest'
import type { Player, PlayerStats } from '../types'
import { getCopy } from './copy'
import { buildShareText } from './shareText'

const player = (id: string, name: string, score: number): Player => ({
  id,
  name,
  emoji: '🎲',
  score,
})

const stats = (playerId: string, overrides: Partial<PlayerStats> = {}): PlayerStats => ({
  playerId,
  wins: 0,
  losses: 0,
  draws: 0,
  highestRound: 0,
  lowestRound: 0,
  ...overrides,
})

describe('buildShareText', () => {
  const t = getCopy('en')

  it('includes player count, round count and winning score', () => {
    const players = [player('p1', 'Ann', 10)]
    const text = buildShareText(t, players, { p1: stats('p1') }, 3, 100)
    expect(text).toContain('Players: 1')
    expect(text).toContain('Rounds: 3')
    expect(text).toContain('Winning score: 100')
  })

  it('reports "Not set" when there is no winning score', () => {
    const players = [player('p1', 'Ann', 10)]
    const text = buildShareText(t, players, { p1: stats('p1') }, 0, null)
    expect(text).toContain('Winning score: Not set')
  })

  it('renders one ranking line per player in the given order', () => {
    const players = [player('p1', 'Ann', 30), player('p2', 'Bob', 10)]
    const playerStats = {
      p1: stats('p1', { wins: 2, losses: 0, draws: 1, highestRound: 15, lowestRound: 5 }),
      p2: stats('p2', { wins: 0, losses: 2, draws: 1, highestRound: 5, lowestRound: -5 }),
    }
    const text = buildShareText(t, players, playerStats, 3, 50)
    const lines = text.split('\n')
    expect(lines).toContain('Rank 1 - 🎲 Ann: 30 pts | W/L/D 2/0/1 | Highest 15, Lowest 5')
    expect(lines).toContain('Rank 2 - 🎲 Bob: 10 pts | W/L/D 0/2/1 | Highest 5, Lowest -5')
  })

  it('falls back to 0 for highest/lowest when a player has no rounds', () => {
    const players = [player('p1', 'Ann', 0)]
    const playerStats = {
      p1: stats('p1', { highestRound: Number.NEGATIVE_INFINITY, lowestRound: Number.POSITIVE_INFINITY }),
    }
    const text = buildShareText(t, players, playerStats, 0, null)
    expect(text).toContain('Highest 0, Lowest 0')
  })
})
