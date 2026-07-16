import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { PLAYER_EMOJIS } from '../lib/constants'
import { getOrCreateDeviceId } from '../lib/deviceId'
import { createRoom as createRoomInFirestore, joinRoom as joinRoomInFirestore, writeRoomState, type RoomState } from '../lib/roomSync'
import type { Player, Round } from '../types'

type SyncStatus = 'idle' | 'connecting' | 'connected' | 'error'

type GameState = {
  gameStarted: boolean
  startingScore: number
  winningScore: number | null
  gameEnded: boolean
  players: Player[]
  rounds: Round[]
  roomCode: string | null
  deviceId: string
  isHost: boolean
  syncStatus: SyncStatus
  startGame: (playerNames: string[], startingScore: number, winningScore?: number | null) => void
  addRound: (deltas: Record<string, number>) => void
  updateLastRound: (deltas: Record<string, number>) => void
  deleteLastRound: () => void
  setGameEnded: (ended: boolean) => void
  resetGame: () => void
  leaveRoom: () => void
  createRoom: () => Promise<string>
  joinRoom: (roomCode: string) => Promise<boolean>
  applyRemoteState: (room: RoomState | null) => void
}

const createPlayerId = (index: number) => `player-${index + 1}`

const getRandomEmojis = (count: number) => {
  const pool = [...PLAYER_EMOJIS]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return Array.from({ length: count }, (_, index) => pool[index % pool.length])
}

const applyDeltas = (players: Player[], deltas: Record<string, number>, sign: 1 | -1) =>
  players.map((player) => ({
    ...player,
    score: player.score + sign * (deltas[player.id] ?? 0),
  }))

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => {
      const writeRoomStateSafely = (roomCode: string, partial: Parameters<typeof writeRoomState>[1]) => {
        writeRoomState(roomCode, partial).catch((error) => {
          console.error('[roomSync] writeRoomState failed', error)
          set({ syncStatus: 'error' })
        })
      }

      return {
      gameStarted: false,
      startingScore: 0,
      winningScore: null,
      gameEnded: false,
      players: [],
      rounds: [],
      roomCode: null,
      deviceId: getOrCreateDeviceId(),
      isHost: false,
      syncStatus: 'idle',
      startGame: (playerNames, startingScore, winningScore = null) => {
        const state = get()
        if (state.roomCode && !state.isHost) return

        const emojis = getRandomEmojis(playerNames.length)
        const players = playerNames.map((name, index) => ({
          id: createPlayerId(index),
          name: name.trim(),
          emoji: emojis[index],
          score: startingScore,
        }))
        set({
          gameStarted: true,
          startingScore,
          winningScore,
          gameEnded: false,
          rounds: [],
          players,
        })
        if (state.roomCode) {
          writeRoomStateSafely(state.roomCode, {
            gameStarted: true,
            startingScore,
            winningScore,
            gameEnded: false,
            rounds: [],
            players,
          })
        }
      },
      addRound: (deltas) => {
        const state = get()
        if (state.roomCode && !state.isHost) return

        const rounds = [
          ...state.rounds,
          {
            id: crypto.randomUUID(),
            deltas,
            createdAt: Date.now(),
          },
        ]
        const players = applyDeltas(state.players, deltas, 1)
        set({ rounds, players })
        if (state.roomCode) {
          writeRoomStateSafely(state.roomCode, { players, rounds })
        }
      },
      updateLastRound: (deltas) => {
        const state = get()
        if (state.roomCode && !state.isHost) return
        if (!state.rounds.length) {
          return
        }

        const lastRound = state.rounds[state.rounds.length - 1]
        const revertedPlayers = applyDeltas(state.players, lastRound.deltas, -1)
        const players = applyDeltas(revertedPlayers, deltas, 1)
        const rounds = [
          ...state.rounds.slice(0, -1),
          {
            ...lastRound,
            deltas,
          },
        ]

        set({ players, rounds })
        if (state.roomCode) {
          writeRoomStateSafely(state.roomCode, { players, rounds })
        }
      },
      deleteLastRound: () => {
        const state = get()
        if (state.roomCode && !state.isHost) return
        if (!state.rounds.length) {
          return
        }

        const lastRound = state.rounds[state.rounds.length - 1]
        const rounds = state.rounds.slice(0, -1)
        const players = applyDeltas(state.players, lastRound.deltas, -1)

        set({ rounds, players })
        if (state.roomCode) {
          writeRoomStateSafely(state.roomCode, { players, rounds })
        }
      },
      setGameEnded: (ended) => {
        const state = get()
        if (state.roomCode && !state.isHost) return

        set({ gameEnded: ended })
        if (state.roomCode) {
          writeRoomStateSafely(state.roomCode, { gameEnded: ended })
        }
      },
      resetGame: () => {
        const state = get()
        if (state.roomCode && !state.isHost) return

        set({
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
      },
      leaveRoom: () => {
        set({
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
      },
      createRoom: async () => {
        const state = get()
        const roomCode = await createRoomInFirestore(
          {
            gameStarted: state.gameStarted,
            startingScore: state.startingScore,
            winningScore: state.winningScore,
            gameEnded: state.gameEnded,
            players: state.players,
            rounds: state.rounds,
          },
          state.deviceId,
        )
        set({ roomCode, isHost: true, syncStatus: 'connected' })
        return roomCode
      },
      joinRoom: async (roomCode) => {
        set({ syncStatus: 'connecting' })
        const room = await joinRoomInFirestore(roomCode)
        if (!room) {
          set({ syncStatus: 'error' })
          return false
        }

        set({
          roomCode: room.roomCode,
          isHost: room.hostDeviceId === get().deviceId,
          gameStarted: room.gameStarted,
          startingScore: room.startingScore,
          winningScore: room.winningScore,
          gameEnded: room.gameEnded,
          players: room.players,
          rounds: room.rounds,
          syncStatus: 'connected',
        })
        return true
      },
      applyRemoteState: (room) => {
        if (!room) {
          set({ syncStatus: 'error' })
          return
        }

        set({
          roomCode: room.roomCode,
          isHost: room.hostDeviceId === get().deviceId,
          gameStarted: room.gameStarted,
          startingScore: room.startingScore,
          winningScore: room.winningScore,
          gameEnded: room.gameEnded,
          players: room.players,
          rounds: room.rounds,
          syncStatus: 'connected',
        })
      },
      }
    },
    {
      name: 'scorekeeper-game-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gameStarted: state.gameStarted,
        startingScore: state.startingScore,
        winningScore: state.winningScore,
        gameEnded: state.gameEnded,
        players: state.players,
        rounds: state.rounds,
        roomCode: state.roomCode,
      }),
    },
  ),
)
