import { useMemo } from 'react'
import { KITTY_DAILY_MESSAGES } from '../data/content'

function dayIndex() {
  const d = new Date()
  return d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate()
}

export function KittyCorner() {
  const msg = useMemo(() => {
    const i = dayIndex() % KITTY_DAILY_MESSAGES.length
    return KITTY_DAILY_MESSAGES[i]
  }, [])

  return (
    <section id="kitty" className="section kitty-section">
      <h2 className="section-title">La ventanita de Kitty 🎀</h2>
      <p className="section-lead">Un mensaje distinto según el día (en tu dispositivo).</p>
      <div className="kitty-window card">
        <div className="kitty-sky" aria-hidden>
          <span className="kitty-moon">🌙</span>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="kitty-star" style={{ '--s': `${0.4 + (i % 5) * 0.12}s` }} />
          ))}
        </div>
        <p className="kitty-msg">{msg}</p>
      </div>
    </section>
  )
}
