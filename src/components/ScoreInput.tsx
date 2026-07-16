import type { FormEvent } from 'react'
import type { CopyStrings } from '../lib/copy'
import type { Player } from '../types'

type SyncStatus = 'idle' | 'connecting' | 'connected' | 'error'

type ScoreInputProps = {
  t: CopyStrings
  players: Player[]
  roundInputs: Record<string, string>
  roundCount: number
  winnerNotice: string
  roomCode: string | null
  syncStatus: SyncStatus
  roomLinkStatus: string
  onRoundInputChange: (playerId: string, value: string) => void
  onRoundInputFocus: (playerId: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onEditLastRound: () => void
  onEndGame: () => void
  onDeleteLastRound: () => void
  onResetGame: () => void
  onCreateRoom: () => void
  onCopyRoomLink: () => void
}

export function ScoreInput({
  t,
  players,
  roundInputs,
  roundCount,
  winnerNotice,
  roomCode,
  syncStatus,
  roomLinkStatus,
  onRoundInputChange,
  onRoundInputFocus,
  onSubmit,
  onEditLastRound,
  onEndGame,
  onDeleteLastRound,
  onResetGame,
  onCreateRoom,
  onCopyRoomLink,
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

      <div className="room-bar">
        <div className="room-bar-info">
          {roomCode ? (
            <span className="room-status">
              <span
                className={`room-status-dot${syncStatus === 'error' ? ' is-error' : ''}`}
                aria-hidden="true"
              />
              {t.liveSyncLabel}
              <span className="room-code-pill">{roomCode}</span>
            </span>
          ) : null}
          {syncStatus === 'error' ? <span className="sync-error-banner">{t.syncErrorNotice}</span> : null}
        </div>
        <div className="room-bar-actions">
          {roomCode ? (
            <button type="button" className="button ghost" onClick={onCopyRoomLink}>
              {t.copyRoomLink}
            </button>
          ) : (
            <button type="button" className="button ghost" onClick={onCreateRoom}>
              {t.createSyncRoom}
            </button>
          )}
          {roomLinkStatus ? <span className="subtle">{roomLinkStatus}</span> : null}
        </div>
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
