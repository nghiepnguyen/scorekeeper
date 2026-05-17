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
