import type { FormEvent, RefObject } from 'react'
import type { CopyStrings } from '../lib/copy'
import { MAX_PLAYERS, PREVIEW_EMOJIS } from '../lib/constants'

type SetupProps = {
  t: CopyStrings
  startingScore: string
  winningScoreInput: string
  playerNames: string[]
  setupError: string
  playerInputRefs: RefObject<Array<HTMLInputElement | null>>
  onStartingScoreChange: (value: string) => void
  onStartingScoreFocus: () => void
  onStartingScoreBlur: () => void
  onWinningScoreInputChange: (value: string) => void
  onPlayerNameChange: (index: number, value: string) => void
  onAddPlayer: () => void
  onRemovePlayer: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function Setup({
  t,
  startingScore,
  winningScoreInput,
  playerNames,
  setupError,
  playerInputRefs,
  onStartingScoreChange,
  onStartingScoreFocus,
  onStartingScoreBlur,
  onWinningScoreInputChange,
  onPlayerNameChange,
  onAddPlayer,
  onRemovePlayer,
  onSubmit,
}: SetupProps) {
  return (
    <section className="panel">
      <h2 className="type-section-heading">{t.setupHeading}</h2>
      <form onSubmit={onSubmit} className="stack">
        <div className="field-row">
          <label className="field">
            <span>{t.startingScore}</span>
            <input
              type="number"
              value={startingScore}
              onChange={(event) => onStartingScoreChange(event.target.value)}
              onFocus={onStartingScoreFocus}
              onBlur={onStartingScoreBlur}
            />
          </label>
          <label className="field">
            <span>{t.winningScore}</span>
            <input
              type="number"
              placeholder={t.winningScorePlaceholder}
              value={winningScoreInput}
              onChange={(event) => onWinningScoreInputChange(event.target.value)}
            />
          </label>
        </div>

        <div className="stack">
          <span>
            {t.players} ({playerNames.length}/{MAX_PLAYERS})
          </span>
          {playerNames.map((name, index) => (
            <div key={index} className="player-name-row">
              <span className="player-emoji-badge">{PREVIEW_EMOJIS[index % PREVIEW_EMOJIS.length]}</span>
              <input
                type="text"
                placeholder={t.playerPlaceholder(index)}
                value={name}
                ref={(element) => {
                  playerInputRefs.current[index] = element
                }}
                onChange={(event) => onPlayerNameChange(index, event.target.value)}
              />
            </div>
          ))}
          <div className="inline-actions player-actions">
            <button type="button" className="button success" onClick={onAddPlayer}>
              {t.addPlayer}
            </button>
            <button type="button" className="button danger" onClick={onRemovePlayer}>
              {t.removePlayer}
            </button>
          </div>
          {setupError ? <p className="form-error">{setupError}</p> : null}
        </div>

        <button type="submit" className="button primary">
          {t.startGame}
        </button>
      </form>
    </section>
  )
}
