const ROOM_PARAM = 'room'

export function getRoomCodeFromUrl(): string | null {
  return new URL(window.location.href).searchParams.get(ROOM_PARAM)
}

export function setRoomCodeInUrl(code: string): void {
  const url = new URL(window.location.href)
  url.searchParams.set(ROOM_PARAM, code)
  window.history.replaceState(null, '', url)
}

export function clearRoomCodeFromUrl(): void {
  const url = new URL(window.location.href)
  if (!url.searchParams.has(ROOM_PARAM)) return
  url.searchParams.delete(ROOM_PARAM)
  window.history.replaceState(null, '', url)
}
