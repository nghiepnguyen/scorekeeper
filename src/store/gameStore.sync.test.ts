import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/roomSync', () => ({
  createRoom: vi.fn(),
  joinRoom: vi.fn(),
  writeRoomState: vi.fn(),
  subscribeToRoom: vi.fn(),
}))

import { useGameStore } from './gameStore'
import { createRoom, joinRoom, writeRoomState } from '../lib/roomSync'

const resetStore = () => {
  useGameStore.setState({
    gameStarted: false,
    startingScore: 0,
    winningScore: null,
    gameEnded: false,
    players: [],
    rounds: [],
    roomCode: null,
    isHost: false,
    syncStatus: 'idle',
  })
}

describe('useGameStore sync behavior', () => {
  beforeEach(() => {
    resetStore()
    localStorage.clear()
    vi.mocked(createRoom).mockReset()
    vi.mocked(joinRoom).mockReset()
    vi.mocked(writeRoomState).mockReset()
    vi.mocked(writeRoomState).mockResolvedValue(undefined)
  })

  describe('createRoom', () => {
    it('sets roomCode/isHost/syncStatus on success', async () => {
      vi.mocked(createRoom).mockResolvedValue('ABC123')
      useGameStore.getState().startGame(['Ann', 'Bob'], 0)

      const code = await useGameStore.getState().createRoom()

      expect(code).toBe('ABC123')
      const state = useGameStore.getState()
      expect(state.roomCode).toBe('ABC123')
      expect(state.isHost).toBe(true)
      expect(state.syncStatus).toBe('connected')
    })
  })

  describe('joinRoom', () => {
    it('applies remote state and sets isHost false for a non-host device', async () => {
      vi.mocked(joinRoom).mockResolvedValue({
        roomCode: 'ABC123',
        hostDeviceId: 'someone-else',
        gameStarted: true,
        startingScore: 10,
        winningScore: 50,
        gameEnded: false,
        players: [{ id: 'player-1', name: 'Ann', emoji: '🐱', score: 10 }],
        rounds: [],
        allowGuestScoring: false,
        createdAt: 0,
        updatedAt: 0,
      })

      const joined = await useGameStore.getState().joinRoom('ABC123')

      expect(joined).toBe(true)
      const state = useGameStore.getState()
      expect(state.roomCode).toBe('ABC123')
      expect(state.isHost).toBe(false)
      expect(state.players).toHaveLength(1)
      expect(state.winningScore).toBe(50)
      expect(state.syncStatus).toBe('connected')
    })

    it('sets syncStatus to error when the room does not exist', async () => {
      vi.mocked(joinRoom).mockResolvedValue(null)

      const joined = await useGameStore.getState().joinRoom('NOPE00')

      expect(joined).toBe(false)
      expect(useGameStore.getState().syncStatus).toBe('error')
    })
  })

  describe('addRound with an active room', () => {
    it('writes the new state to Firestore when the local device is host', () => {
      useGameStore.getState().startGame(['Ann'], 0)
      useGameStore.setState({ roomCode: 'ABC123', isHost: true })

      useGameStore.getState().addRound({ 'player-1': 10 })

      expect(useGameStore.getState().players[0].score).toBe(10)
      expect(writeRoomState).toHaveBeenCalledWith(
        'ABC123',
        expect.objectContaining({
          players: expect.arrayContaining([expect.objectContaining({ id: 'player-1', score: 10 })]),
        }),
      )
    })

    it('is a no-op and does not write to Firestore when the local device is not host', () => {
      useGameStore.getState().startGame(['Ann'], 0)
      useGameStore.setState({ roomCode: 'ABC123', isHost: false })

      useGameStore.getState().addRound({ 'player-1': 10 })

      expect(useGameStore.getState().players[0].score).toBe(0)
      expect(useGameStore.getState().rounds).toHaveLength(0)
      expect(writeRoomState).not.toHaveBeenCalled()
    })
  })

  describe('setGameEnded with an active room', () => {
    it('sets gameEnded and writes to Firestore when the local device is host', () => {
      useGameStore.getState().startGame(['Ann'], 0, 50)
      useGameStore.setState({ roomCode: 'ABC123', isHost: true })

      useGameStore.getState().setGameEnded(true)

      expect(useGameStore.getState().gameEnded).toBe(true)
      expect(writeRoomState).toHaveBeenCalledWith('ABC123', { gameEnded: true })
    })

    it('is a no-op when the local device is not host', () => {
      useGameStore.getState().startGame(['Ann'], 0, 50)
      useGameStore.setState({ roomCode: 'ABC123', isHost: false })

      useGameStore.getState().setGameEnded(true)

      expect(useGameStore.getState().gameEnded).toBe(false)
      expect(writeRoomState).not.toHaveBeenCalled()
    })
  })

  describe('resetGame with an active room', () => {
    it('clears the room when the local device is host', () => {
      useGameStore.getState().startGame(['Ann'], 0)
      useGameStore.setState({ roomCode: 'ABC123', isHost: true })

      useGameStore.getState().resetGame()

      expect(useGameStore.getState().roomCode).toBeNull()
      expect(useGameStore.getState().gameStarted).toBe(false)
    })

    it('is a no-op when the local device is not host', () => {
      useGameStore.getState().startGame(['Ann'], 0)
      useGameStore.setState({ roomCode: 'ABC123', isHost: false })

      useGameStore.getState().resetGame()

      expect(useGameStore.getState().roomCode).toBe('ABC123')
      expect(useGameStore.getState().gameStarted).toBe(true)
    })
  })
})
