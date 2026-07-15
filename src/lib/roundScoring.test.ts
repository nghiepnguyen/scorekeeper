import { describe, expect, it } from 'vitest'
import type { Player, Round } from '../types'
import {
  emptyRoundInputs,
  normalizeRoundInput,
  reachesWinningScore,
  simulateScoresAfterAdd,
  simulateScoresAfterEditLast,
  sortPlayers,
} from './roundScoring'

const player = (id: string, name: string, score: number): Player => ({
  id,
  name,
  emoji: '🎲',
  score,
})

describe('normalizeRoundInput', () => {
  it('parses numeric strings per player', () => {
    const players = [player('p1', 'A', 0), player('p2', 'B', 0)]
    const result = normalizeRoundInput(players, { p1: '10', p2: '-5' })
    expect(result).toEqual({ p1: 10, p2: -5 })
  })

  it('defaults missing input to 0', () => {
    const players = [player('p1', 'A', 0)]
    const result = normalizeRoundInput(players, {})
    expect(result).toEqual({ p1: 0 })
  })

  it('defaults non-numeric input to 0', () => {
    const players = [player('p1', 'A', 0)]
    const result = normalizeRoundInput(players, { p1: 'abc' })
    expect(result).toEqual({ p1: 0 })
  })
})

describe('emptyRoundInputs', () => {
  it('maps every player id to an empty string', () => {
    const players = [player('p1', 'A', 0), player('p2', 'B', 0)]
    expect(emptyRoundInputs(players)).toEqual({ p1: '', p2: '' })
  })
})

describe('reachesWinningScore', () => {
  it('returns false when winning score is null', () => {
    expect(reachesWinningScore([100, 200], null)).toBe(false)
  })

  it('returns true when a score meets the winning score', () => {
    expect(reachesWinningScore([50, 100], 100)).toBe(true)
  })

  it('returns true when a score exceeds the winning score', () => {
    expect(reachesWinningScore([150], 100)).toBe(true)
  })

  it('returns false when no score reaches the winning score', () => {
    expect(reachesWinningScore([50, 90], 100)).toBe(false)
  })
})

describe('simulateScoresAfterAdd', () => {
  it('adds deltas on top of current scores', () => {
    const players = [player('p1', 'A', 10), player('p2', 'B', 20)]
    const result = simulateScoresAfterAdd(players, { p1: 5, p2: -3 })
    expect(result).toEqual([15, 17])
  })

  it('treats missing deltas as 0', () => {
    const players = [player('p1', 'A', 10)]
    expect(simulateScoresAfterAdd(players, {})).toEqual([10])
  })
})

describe('simulateScoresAfterEditLast', () => {
  it('returns current scores unchanged when there are no rounds', () => {
    const players = [player('p1', 'A', 10)]
    expect(simulateScoresAfterEditLast(players, [], { p1: 99 })).toEqual([10])
  })

  it('replaces the last round deltas with the new deltas', () => {
    const players = [player('p1', 'A', 30)]
    const rounds: Round[] = [{ id: 'r1', deltas: { p1: 20 }, createdAt: 0 }]
    // player.score(30) already includes the old delta(20) -> base was 10
    const result = simulateScoresAfterEditLast(players, rounds, { p1: 5 })
    expect(result).toEqual([15])
  })
})

describe('sortPlayers', () => {
  it('sorts by score descending', () => {
    const players = [player('p1', 'A', 10), player('p2', 'B', 30), player('p3', 'C', 20)]
    expect(sortPlayers(players).map((p) => p.id)).toEqual(['p2', 'p3', 'p1'])
  })

  it('breaks ties by name ascending', () => {
    const players = [player('p1', 'Zed', 10), player('p2', 'Ann', 10)]
    expect(sortPlayers(players).map((p) => p.id)).toEqual(['p2', 'p1'])
  })

  it('does not mutate the input array', () => {
    const players = [player('p1', 'A', 10), player('p2', 'B', 30)]
    sortPlayers(players)
    expect(players.map((p) => p.id)).toEqual(['p1', 'p2'])
  })
})
