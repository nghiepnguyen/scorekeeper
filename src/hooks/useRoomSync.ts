import { useEffect } from 'react'
import { subscribeToRoom } from '../lib/roomSync'
import { clearRoomCodeFromUrl, getRoomCodeFromUrl, setRoomCodeInUrl } from '../lib/roomUrl'
import { useGameStore } from '../store/gameStore'

export function useRoomSync() {
  const roomCode = useGameStore((state) => state.roomCode)

  useEffect(() => {
    const urlCode = getRoomCodeFromUrl()
    if (urlCode && urlCode !== useGameStore.getState().roomCode) {
      void useGameStore.getState().joinRoom(urlCode)
    }
  }, [])

  useEffect(() => {
    if (!roomCode) {
      clearRoomCodeFromUrl()
      return
    }

    setRoomCodeInUrl(roomCode)
    const unsubscribe = subscribeToRoom(roomCode, (room) => {
      useGameStore.getState().applyRemoteState(room)
    })
    return unsubscribe
  }, [roomCode])
}
