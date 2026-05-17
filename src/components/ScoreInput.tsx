import type { FormEvent } from 'react'
import type { CopyStrings } from '../lib/copy'
import type { Player } from '../types'

type ScoreInputProps = {
  t: CopyStrings
  players: Player[]
  roundInputs: Record<string, string>
  roundCount: number
  winnerNotice: string
  onRoundInputChange: (playerId: string, value: string) => void
  onRoundInputFocus: (playerId: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onEditLastRound: () => void
  onEndGame: () => void
  onDeleteLastRound: () => void
  onResetGame: () => void
}

export function ScoreInput({
  t,
  players,
  roundInputs,
  roundCount,
  winnerNotice,
  onRoundInputChange,
  onRoundInputFocus,
  onSubmit,
  onEditLastRound,
  onEndGame,
  onDeleteLastRound,
  onResetGame,
}: ScoreInputProps) {
  return (
    <article className="panel">
      {winnerNotice ? <p className="winner-notice animate-pop">{winnerNotice}</p> : null}
      <div className="title-row">
        <h2 className="type-subheading">{t.scoreInputHeading}</h2>
        <button type="button" className="button ghost" onClick={onResetGame}>
          {t.newRoom}
        </button>
      </div>

      <form onSubmit={onSubmit} className="stack">
        <div className="score-player-grid">
          {players.map((player) => (
            <label key={player.id} className="field">
              <span>
                <span className="emoji-inline-badge">{player.emoji}</span> {player.name}
              </span>
              <input
                type="number"
                placeholder="0"
                value={roundInputs[player.id] ?? ''}
                onChange={(event) => onRoundInputChange(player.id, event.target.value)}
                onFocus={() => onRoundInputFocus(player.id)}
              />
            </label>
          ))}
        </div>
        <div className="score-actions">
          <button type="submit" className="button primary">
            {t.saveRound}
          </button>
          <button type="button" className="button ghost" onClick={onEditLastRound} disabled={!roundCount}>
            {t.editLastRound}
          </button>
          <button type="button" className="button primary" onClick={onEndGame} disabled={!roundCount}>
            {t.endGame}
          </button>
          <button type="button" className="button ghost" onClick={onDeleteLastRound} disabled={!roundCount}>
            {t.deleteLastRound}
          </button>
        </div>
      </form>
      <p className="subtle">{t.playedRounds(roundCount)}</p>
    </article>
  )
}
