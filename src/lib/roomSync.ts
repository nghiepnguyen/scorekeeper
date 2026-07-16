import { doc, getDoc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore'
import { db } from './firebase'
import type { Player, Round } from '../types/game'

export type RoomState = {
  roomCode: string
  hostDeviceId: string
  gameStarted: boolean
  startingScore: number
  players: Player[]
  rounds: Round[]
  allowGuestScoring: boolean
  createdAt: number
  updatedAt: number
}

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const ROOM_CODE_LENGTH = 6
const MAX_CODE_GENERATION_ATTEMPTS = 5

function generateRoomCode(): string {
  let code = ''
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]
  }
  return code
}

function roomDocRef(roomCode: string) {
  return doc(db, 'rooms', roomCode)
}

export async function createRoom(
  initialState: Pick<RoomState, 'gameStarted' | 'startingScore' | 'players' | 'rounds'>,
  hostDeviceId: string,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
    const roomCode = generateRoomCode()
    const existing = await getDoc(roomDocRef(roomCode))
    if (existing.exists()) continue

    const now = Date.now()
    const room: RoomState = {
      roomCode,
      hostDeviceId,
      allowGuestScoring: false,
      createdAt: now,
      updatedAt: now,
      ...initialState,
    }
    await setDoc(roomDocRef(roomCode), room)
    return roomCode
  }

  throw new Error('Could not generate a unique room code, please try again')
}

export async function joinRoom(roomCode: string): Promise<RoomState | null> {
  const snapshot = await getDoc(roomDocRef(roomCode))
  if (!snapshot.exists()) return null
  return snapshot.data() as RoomState
}

export function subscribeToRoom(
  roomCode: string,
  onUpdate: (room: RoomState | null) => void,
): Unsubscribe {
  return onSnapshot(roomDocRef(roomCode), (snapshot) => {
    onUpdate(snapshot.exists() ? (snapshot.data() as RoomState) : null)
  })
}

export async function writeRoomState(
  roomCode: string,
  partial: Partial<Omit<RoomState, 'roomCode' | 'hostDeviceId' | 'createdAt'>>,
): Promise<void> {
  await setDoc(
    roomDocRef(roomCode),
    { ...partial, updatedAt: Date.now() },
    { merge: true },
  )
}
