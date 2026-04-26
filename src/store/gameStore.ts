import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Player = {
  id: string
  name: string
  emoji: string
  score: number
}

export type Round = {
  id: string
  deltas: Record<string, number>
  createdAt: number
}

type GameState = {
  gameStarted: boolean
  startingScore: number
  players: Player[]
  rounds: Round[]
  startGame: (playerNames: string[], startingScore: number) => void
  addRound: (deltas: Record<string, number>) => void
  updateLastRound: (deltas: Record<string, number>) => void
  deleteLastRound: () => void
  resetGame: () => void
}

const createPlayerId = (index: number) => `player-${index + 1}`
const PLAYER_EMOJIS = ['🐯', '🦊', '🐼', '🐸', '🦁', '🐨', '🐵', '🐙', '🦄', '🐧', '🐻', '🐺']

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
    (set) => ({
      gameStarted: false,
      startingScore: 0,
      players: [],
      rounds: [],
      startGame: (playerNames, startingScore) =>
        set(() => {
          const emojis = getRandomEmojis(playerNames.length)
          return {
            gameStarted: true,
            startingScore,
            rounds: [],
            players: playerNames.map((name, index) => ({
              id: createPlayerId(index),
              name: name.trim(),
              emoji: emojis[index],
              score: startingScore,
            })),
          }
        }),
      addRound: (deltas) =>
        set((state) => ({
          rounds: [
            ...state.rounds,
            {
              id: crypto.randomUUID(),
              deltas,
              createdAt: Date.now(),
            },
          ],
          players: applyDeltas(state.players, deltas, 1),
        })),
      updateLastRound: (deltas) =>
        set((state) => {
          if (!state.rounds.length) {
            return state
          }

          const lastRound = state.rounds[state.rounds.length - 1]
          const revertedPlayers = applyDeltas(state.players, lastRound.deltas, -1)
          const updatedPlayers = applyDeltas(revertedPlayers, deltas, 1)

          return {
            players: updatedPlayers,
            rounds: [
              ...state.rounds.slice(0, -1),
              {
                ...lastRound,
                deltas,
              },
            ],
          }
        }),
      deleteLastRound: () =>
        set((state) => {
          if (!state.rounds.length) {
            return state
          }

          const lastRound = state.rounds[state.rounds.length - 1]

          return {
            rounds: state.rounds.slice(0, -1),
            players: applyDeltas(state.players, lastRound.deltas, -1),
          }
        }),
      resetGame: () =>
        set({
          gameStarted: false,
          startingScore: 0,
          players: [],
          rounds: [],
        }),
    }),
    {
      name: 'scorekeeper-game-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        gameStarted: state.gameStarted,
        startingScore: state.startingScore,
        players: state.players,
        rounds: state.rounds,
      }),
    },
  ),
)
