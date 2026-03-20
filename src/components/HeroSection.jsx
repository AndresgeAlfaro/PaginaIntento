import { useEffect, useRef, useState } from 'react'
import { useSectionNav } from '../SectionNavContext'

const LS_DED = 'para-ti-dedicatoria'
const DEFAULT_HEADING = 'Hola, Mi señora 💜'
const DEFAULT_SUB = 'Esta página es solo para ti'

function loadDedicatoria() {
  try {
    const raw = localStorage.getItem(LS_DED)
    if (!raw) return { heading: DEFAULT_HEADING, subtext: DEFAULT_SUB }
    const j = JSON.parse(raw)
    return {
      heading: typeof j.heading === 'string' && j.heading.trim() ? j.heading.trim() : DEFAULT_HEADING,
      subtext: typeof j.subtext === 'string' && j.subtext.trim() ? j.subtext.trim() : DEFAULT_SUB,
    }
  } catch {
    return { heading: DEFAULT_HEADING, subtext: DEFAULT_SUB }
  }
}

function saveDedicatoria(heading, subtext) {
  localStorage.setItem(LS_DED, JSON.stringify({ heading, subtext }))
}

const KITTY_ART = `
    /\\_/\\
   ( o.o )
    > ^ <   💜
   ╱|   |╲
`

export function HeroSection() {
  const { navigate } = useSectionNav()
  const savedOnLoad = !!localStorage.getItem(LS_DED)
  const hadSaved = useRef(savedOnLoad)
  const initial = loadDedicatoria()
  const [heading, setHeading] = useState(initial.heading)
  const [subtext, setSubtext] = useState(initial.subtext)
  const [typed, setTyped] = useState(savedOnLoad ? initial.subtext : '')
  const [editOpen, setEditOpen] = useState(false)
  const [draftH, setDraftH] = useState(initial.heading)
  const [draftS, setDraftS] = useState(initial.subtext)

  useEffect(() => {
    if (hadSaved.current) return undefined
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setTyped(subtext.slice(0, i))
      if (i >= subtext.length) window.clearInterval(id)
    }, 42)
    return () => window.clearInterval(id)
  }, [subtext])

  const saveEdit = () => {
    const h = draftH.trim() || DEFAULT_HEADING
    const s = draftS.trim() || DEFAULT_SUB
    setHeading(h)
    setSubtext(s)
    setTyped(s)
    hadSaved.current = true
    saveDedicatoria(h, s)
    setEditOpen(false)
  }

  return (
    <section id="hero" className="section hero-section">
      <div className="hero-particles" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="hero-particle"
            style={{
              '--d': `${i * 0.55}s`,
              left: `${5 + ((i * 37) % 86)}%`,
            }}
          />
        ))}
      </div>
      <div className="hero-floaters" aria-hidden>
        <span className="floater">🐱</span>
        <span className="floater">⭐</span>
        <span className="floater">💜</span>
        <span className="floater">✨</span>
        <span className="floater">🌸</span>
      </div>
      <div className="card hero-card">
        <h1 className="hero-glow">{heading}</h1>
        <p className="hero-sub">
          <span className="hero-caret" aria-hidden>
            |
          </span>
          {typed}
        </p>
        <pre className="kitty-art" role="img" aria-label="Hello Kitty estilizada">
          {KITTY_ART}
        </pre>

        <button
          type="button"
          className="btn-secondary hero-edit-btn"
          onClick={() => {
            setDraftH(heading)
            setDraftS(subtext)
            setEditOpen((o) => !o)
          }}
        >
          {editOpen ? 'Cerrar editor' : 'Personalizar dedicatoria ✏️'}
        </button>

        {editOpen && (
          <div className="hero-edit-panel">
            <label className="diary-label" htmlFor="ded-h">
              Mensaje principal (título)
            </label>
            <input
              id="ded-h"
              className="diary-input"
              value={draftH}
              onChange={(e) => setDraftH(e.target.value)}
              maxLength={120}
            />
            <label className="diary-label" htmlFor="ded-s">
              Subtítulo (línea que se escribe sola la primera vez)
            </label>
            <textarea
              id="ded-s"
              className="diary-textarea"
              rows={2}
              value={draftS}
              onChange={(e) => setDraftS(e.target.value)}
              maxLength={280}
            />
            <button type="button" className="btn-primary" onClick={saveEdit}>
              Guardar en este dispositivo 💜
            </button>
          </div>
        )}

        <button type="button" className="btn-primary" onClick={() => navigate('kpop')}>
          Empieza por aquí ✨
        </button>
      </div>
    </section>
  )
}
