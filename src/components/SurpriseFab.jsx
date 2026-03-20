import confetti from 'canvas-confetti'

function burst() {
  const c = ['#7B2FBE', '#C084FC', '#F472B6', '#fff', '#a78bfa']
  confetti({
    particleCount: 100,
    spread: 88,
    origin: { y: 0.85, x: 0.88 },
    colors: c,
    scalar: 1.05,
  })
  confetti({
    particleCount: 55,
    angle: 120,
    spread: 55,
    origin: { x: 0.88, y: 0.85 },
    colors: c,
  })
}

export function SurpriseFab() {
  return (
    <button type="button" className="surprise-fab" onClick={burst}>
      🌸 Surprise!
    </button>
  )
}
