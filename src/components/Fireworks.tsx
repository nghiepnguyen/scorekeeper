import type { CSSProperties } from 'react'

const BURSTS = [
  { left: '8%', bottom: '8%', delay: 0, color: '#ffd84d' },
  { left: '22%', bottom: '14%', delay: 0.35, color: '#ff7ad9' },
  { left: '38%', bottom: '6%', delay: 0.7, color: '#6ef7ff' },
  { left: '52%', bottom: '12%', delay: 1.05, color: '#93ff8f' },
  { left: '66%', bottom: '7%', delay: 1.4, color: '#7c6dff' },
  { left: '80%', bottom: '15%', delay: 1.75, color: '#ff9f6b' },
  { left: '92%', bottom: '9%', delay: 2.1, color: '#ffd84d' },
  { left: '15%', bottom: '22%', delay: 0.55, color: '#6ef7ff' },
  { left: '45%', bottom: '20%', delay: 1.25, color: '#ff7ad9' },
  { left: '75%', bottom: '24%', delay: 1.9, color: '#93ff8f' },
] as const

const PARTICLE_COUNT = 16

export function Fireworks() {
  return (
    <div className="fireworks-layer" aria-hidden="true">
      {BURSTS.map((burst, burstIndex) => (
        <FireworkBurst key={burstIndex} burst={burst} />
      ))}
    </div>
  )
}

function FireworkBurst({ burst }: { burst: (typeof BURSTS)[number] }) {
  const style: CSSProperties = {
    left: burst.left,
    bottom: burst.bottom,
    '--burst-delay': `${burst.delay}s`,
    '--burst-color': burst.color,
  } as CSSProperties

  return (
    <div className="firework-burst" style={style}>
      <span className="firework-rocket" />
      <span className="firework-flash" />
      {Array.from({ length: PARTICLE_COUNT }).map((_, index) => (
        <span
          key={index}
          className="firework-particle"
          style={
            {
              '--particle-angle': `${(360 / PARTICLE_COUNT) * index}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
