export function Confetti() {
  return (
    <div className="confetti-layer" aria-hidden="true">
      {Array.from({ length: 22 }).map((_, index) => (
        <span key={index} className="confetti-piece" />
      ))}
    </div>
  )
}
