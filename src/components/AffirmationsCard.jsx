import { useCallback, useState } from 'react'
import { AFFIRMATIONS } from '../data/content'

function pickRandom() {
  return AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]
}

export function AffirmationsCard() {
  const [text, setText] = useState(() => pickRandom())
  const [flip, setFlip] = useState(false)

  const next = useCallback(() => {
    setFlip(true)
    window.setTimeout(() => {
      setText(pickRandom())
      setFlip(false)
    }, 280)
  }, [])

  return (
    <section id="afirmaciones" className="section affirm-section">
      <h2 className="section-title">Afirmación suave 💌</h2>
      <p className="section-lead">Una frase para ti. Puedes pedir otra cuando quieras.</p>
      <div className="affirm-outer">
        <div className={`card affirm-card ${flip ? 'affirm-card--flip' : ''}`}>
          <div className="affirm-sparkles" aria-hidden>
            <span>✨</span>
            <span>💜</span>
            <span>✨</span>
          </div>
          <p className="affirm-text">{text}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={next}>
          Otra afirmación
        </button>
      </div>
    </section>
  )
}
