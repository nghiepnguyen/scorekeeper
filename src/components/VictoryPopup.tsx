import type { CopyStrings } from '../lib/copy'
import type { Player } from '../types'
import { Confetti } from './Confetti'
import { Fireworks } from './Fireworks'

type VictoryPopupProps = {
  t: CopyStrings
  winners: Player[]
  winningScore: number
  onContinue: () => void
}

export function VictoryPopup({ t, winners, winningScore, onContinue }: VictoryPopupProps) {
  const message =
    winners.length === 1
      ? t.victoryMessageSingle(`${winners[0].emoji} ${winners[0].name}`, winningScore)
      : t.victoryMessageMulti(
          winners.length,
          winners.map((p) => `${p.emoji} ${p.name}`).join(', '),
          winningScore,
        )

  return (
    <div className="victory-overlay" role="dialog" aria-modal="true" aria-labelledby="victory-title">
      <div className="victory-backdrop" onClick={onContinue} aria-hidden="true" />
      <Fireworks />
      <Confetti />

      <article className="victory-card panel">
        <p className="victory-badge micro-label">{t.victoryBadge}</p>
        <h2 id="victory-title" className="victory-title type-section-heading">
          {t.victoryTitle}
        </h2>
        <p className="victory-message">{message}</p>

        <ul className="victory-winners">
          {winners.map((player) => (
            <li key={player.id} className="victory-winner-row">
              <span className="victory-winner-name">
                <span className="emoji-inline-badge emoji-inline-badge-lg">{player.emoji}</span>
                {player.name}
              </span>
              <strong className="victory-winner-score type-score-value">{player.score}</strong>
            </li>
          ))}
        </ul>

        <p className="victory-target subtle">
          {t.victoryTargetLabel}: <strong>{winningScore}</strong>
        </p>

        <button type="button" className="button primary victory-cta" onClick={onContinue}>
          {t.victoryContinue}
        </button>
      </article>
    </div>
  )
}
