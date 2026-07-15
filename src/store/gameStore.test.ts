import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './gameStore'

const resetStore = () => {
  useGameStore.setState({
    gameStarted: false,
    startingScore: 0,
    players: [],
    rounds: [],
  })
}

describe('useGameStore', () => {
  beforeEach(() => {
    resetStore()
    localStorage.clear()
  })

  describe('startGame', () => {
    it('creates a trimmed player per name at the starting score', () => {
      useGameStore.getState().startGame(['  Ann ', 'Bob'], 50)
      const { players, gameStarted, startingScore, rounds } = useGameStore.getState()

      expect(gameStarted).toBe(true)
      expect(startingScore).toBe(50)
      expect(rounds).toEqual([])
      expect(players).toHaveLength(2)
      expect(players[0]).toMatchObject({ id: 'player-1', name: 'Ann', score: 50 })
      expect(players[1]).toMatchObject({ id: 'player-2', name: 'Bob', score: 50 })
    })

    it('assigns every player a distinct emoji when there are fewer players than emoji pool size', () => {
      useGameStore.getState().startGame(['Ann', 'Bob', 'Cid'], 0)
      const { players } = useGameStore.getState()
      const emojis = new Set(players.map((p) => p.emoji))
      expect(emojis.size).toBe(players.length)
    })
  })

  describe('addRound', () => {
    it('appends a round and applies deltas to player scores', () => {
      useGameStore.getState().startGame(['Ann', 'Bob'], 0)
      useGameStore.getState().addRound({ 'player-1': 10, 'player-2': -5 })

      const { players, rounds } = useGameStore.getState()
      expect(rounds).toHaveLength(1)
      expect(rounds[0].deltas).toEqual({ 'player-1': 10, 'player-2': -5 })
      expect(players.find((p) => p.id === 'player-1')?.score).toBe(10)
      expect(players.find((p) => p.id === 'player-2')?.score).toBe(-5)
    })

    it('accumulates scores across multiple rounds', () => {
      useGameStore.getState().startGame(['Ann'], 0)
      useGameStore.getState().addRound({ 'player-1': 10 })
      useGameStore.getState().addRound({ 'player-1': 5 })

      const { players, rounds } = useGameStore.getState()
      expect(rounds).toHaveLength(2)
      expect(players[0].score).toBe(15)
    })
  })

  describe('updateLastRound', () => {
    it('reverts the previous deltas and applies the new ones', () => {
      useGameStore.getState().startGame(['Ann'], 0)
      useGameStore.getState().addRound({ 'player-1': 10 })
      useGameStore.getState().updateLastRound({ 'player-1': 3 })

      const { players, rounds } = useGameStore.getState()
      expect(rounds).toHaveLength(1)
      expect(rounds[0].deltas).toEqual({ 'player-1': 3 })
      expect(players[0].score).toBe(3)
    })

    it('is a no-op when there are no rounds', () => {
      useGameStore.getState().startGame(['Ann'], 0)
      useGameStore.getState().updateLastRound({ 'player-1': 99 })

      const { players, rounds } = useGameStore.getState()
      expect(rounds).toHaveLength(0)
      expect(players[0].score).toBe(0)
    })
  })

  describe('deleteLastRound', () => {
    it('removes the last round and reverts its deltas', () => {
      useGameStore.getState().startGame(['Ann'], 0)
      useGameStore.getState().addRound({ 'player-1': 10 })
      useGameStore.getState().addRound({ 'player-1': 5 })
      useGameStore.getState().deleteLastRound()

      const { players, rounds } = useGameStore.getState()
      expect(rounds).toHaveLength(1)
      expect(players[0].score).toBe(10)
    })

    it('is a no-op when there are no rounds', () => {
      useGameStore.getState().startGame(['Ann'], 0)
      useGameStore.getState().deleteLastRound()

      const { players, rounds } = useGameStore.getState()
      expect(rounds).toHaveLength(0)
      expect(players[0].score).toBe(0)
    })
  })

  describe('resetGame', () => {
    it('clears players, rounds and gameStarted', () => {
      useGameStore.getState().startGame(['Ann'], 20)
      useGameStore.getState().addRound({ 'player-1': 10 })
      useGameStore.getState().resetGame()

      const state = useGameStore.getState()
      expect(state.gameStarted).toBe(false)
      expect(state.startingScore).toBe(0)
      expect(state.players).toEqual([])
      expect(state.rounds).toEqual([])
    })
  })
})
