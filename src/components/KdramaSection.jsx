import { useCallback, useEffect, useMemo, useState } from 'react'
import { KDRAMA_BY_MOOD } from '../data/content'
import { addNote, loadNotes } from '../utils/localNotes'
import { createRng } from '../utils/wordSearch'

const LS_WATCHED = 'para-ti-kdrama-visto'
const SEEN_WEIGHT = 0.22
const UNSEEN_WEIGHT = 1

function loadWatchedSet() {
  try {
    const raw = localStorage.getItem(LS_WATCHED)
    const p = JSON.parse(raw || '[]')
    if (!Array.isArray(p)) return new Set()
    return new Set(p.map(String))
  } catch {
    return new Set()
  }
}

function saveWatchedSet(set) {
  localStorage.setItem(LS_WATCHED, JSON.stringify([...set]))
}

function dramaKey(moodKey, title) {
  return `${moodKey}::${title}`
}

function weightedPickDramas(moodKey, list, roll, watchedSet, take = 3) {
  const rng = createRng(roll >>> 0)
  const pool = list.map((d) => ({
    item: d,
    w: watchedSet.has(dramaKey(moodKey, d.title)) ? SEEN_WEIGHT : UNSEEN_WEIGHT,
  }))
  const out = []
  const n = Math.min(take, pool.length)
  for (let k = 0; k < n; k++) {
    const sum = pool.reduce((s, x) => s + x.w, 0)
    let r = rng() * sum
    let idx = 0
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].w
      if (r <= 0) {
        idx = i
        break
      }
    }
    out.push(pool[idx].item)
    pool.splice(idx, 1)
  }
  return out
}

const MOODS = [
  { key: 'cry', label: KDRAMA_BY_MOOD.cry.label },
  { key: 'romance', label: KDRAMA_BY_MOOD.romance.label },
  { key: 'action', label: KDRAMA_BY_MOOD.action.label },
  { key: 'laugh', label: KDRAMA_BY_MOOD.laugh.label },
  { key: 'mystery', label: KDRAMA_BY_MOOD.mystery.label },
]

const REACTIONS = ['😭', '🥰', '😮', '😴', '💜']

function newRollSeed() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0] >>> 0
  }
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0
}

function DramaNoteBox({ moodKey, moodLabel, drama, onSaved }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [reaction, setReaction] = useState('')
  const [msg, setMsg] = useState('')

  const save = () => {
    const t = text.trim()
    if (!t) {
      setMsg('Escribe algo cuando quieras 💜')
      window.setTimeout(() => setMsg(''), 2800)
      return
    }
    addNote({
      type: 'kdrama',
      refId: `${moodKey}::${drama.title}`,
      refTitle: drama.title,
      moodKey,
      moodLabel,
      text: t,
      reaction: reaction || undefined,
    })
    setText('')
    setReaction('')
    setMsg('Guardado solo aquí, en tu dispositivo ✨')
    onSaved()
    window.setTimeout(() => setMsg(''), 3500)
  }

  return (
    <div className="drama-note">
      <button type="button" className="drama-note__toggle btn-secondary btn-small" onClick={() => setOpen((o) => !o)}>
        {open ? 'Cerrar 💬' : '¿Qué te pareció? 💬'}
      </button>
      {open && (
        <div className="drama-note__panel">
          <p className="drama-note__hint">Cómo te sentiste, si lloraste, si lo recomiendas…</p>
          <div className="drama-note__reactions" aria-label="Reacción">
            {REACTIONS.map((e) => (
              <button
                key={e}
                type="button"
                className={`reaction-btn reaction-btn--sm ${reaction === e ? 'reaction-btn--on' : ''}`}
                onClick={() => setReaction((r) => (r === e ? '' : e))}
              >
                {e}
              </button>
            ))}
          </div>
          <textarea
            className="drama-note__textarea"
            rows={3}
            maxLength={2000}
            placeholder={`Nota sobre «${drama.title}»…`}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="button" className="btn-primary drama-note__save" onClick={save}>
            Guardar nota 💜
          </button>
          {msg && <p className="drama-note__msg">{msg}</p>}
        </div>
      )}
    </div>
  )
}

export function KdramaSection() {
  const [active, setActive] = useState(null)
  const [roll, setRoll] = useState(0)
  const [notesTick, setNotesTick] = useState(0)
  const [watched, setWatched] = useState(() => loadWatchedSet())

  useEffect(() => {
    saveWatchedSet(watched)
  }, [watched])

  const refreshNotes = useCallback(() => {
    setNotesTick((t) => t + 1)
  }, [])

  const selectMood = (key) => {
    setActive(key)
    setRoll(newRollSeed())
  }

  const toggleWatched = useCallback((moodKey, title) => {
    const k = dramaKey(moodKey, title)
    setWatched((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }, [])

  const dramas = useMemo(() => {
    if (!active) return []
    const list = KDRAMA_BY_MOOD[active]?.dramas ?? []
    if (list.length <= 3) return [...list]
    return weightedPickDramas(active, list, roll, watched, 3)
  }, [active, roll, watched])

  const kdramaNotes = useMemo(() => {
    void notesTick
    return loadNotes().filter((n) => n.type === 'kdrama')
  }, [notesTick])

  const moodLabel = active ? KDRAMA_BY_MOOD[active].label : ''

  return (
    <section id="kdrama" className="section kdrama-section">
      <h2 className="section-title">¿Qué kdrama ver hoy?</h2>
      <p className="section-lead">
        Elige un mood: tres al azar con menos peso si marcaste «ya lo vi». Todo en tu dispositivo 💜
      </p>
      <div className="mood-chips">
        {MOODS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`mood-chip ${active === key ? 'mood-chip--active' : ''}`}
            onClick={() => selectMood(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {active && (
        <div className="kdrama-picks">
          <div className="kdrama-picks__bar">
            <span className="kdrama-picks__label">{moodLabel}</span>
            <button type="button" className="btn-secondary btn-small" onClick={() => setRoll(newRollSeed())}>
              Otras 3 al azar 🎲
            </button>
          </div>
          <div className="drama-cards drama-cards--enter" key={`${active}-${roll}`}>
            {dramas.map((d) => (
              <article key={d.title} className="card drama-card">
                <div className="drama-card__head">
                  <span className="drama-emoji">{d.emoji}</span>
                  <div>
                    <h3 className="drama-title">{d.title}</h3>
                    <p className="drama-meta">
                      {d.year} · {d.tag}
                    </p>
                  </div>
                </div>
                <p className="drama-desc">{d.desc}</p>
                <div className="drama-card__watched">
                  <button
                    type="button"
                    className={`btn-secondary btn-small drama-watched-btn ${watched.has(dramaKey(active, d.title)) ? 'drama-watched-btn--on' : ''}`}
                    onClick={() => toggleWatched(active, d.title)}
                  >
                    {watched.has(dramaKey(active, d.title)) ? 'Ya lo vi ✓' : 'Marcar ya lo vi'}
                  </button>
                </div>
                <DramaNoteBox moodKey={active} moodLabel={moodLabel} drama={d} onSaved={refreshNotes} />
              </article>
            ))}
          </div>
        </div>
      )}
      {kdramaNotes.length > 0 && (
        <div className="card kdrama-notes-history">
          <h3 className="kdrama-notes-history__title">Tus notas de k-dramas 📺</h3>
          <ul className="kdrama-notes-history__list">
            {kdramaNotes.slice(0, 12).map((n) => (
              <li key={`${n.refId}-${n.ts}`} className="kdrama-notes-history__item">
                <span className="kdrama-notes-history__meta">
                  {new Date(n.ts).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}
                  {n.reaction ? ` ${n.reaction}` : ''}
                </span>
                <span className="kdrama-notes-history__drama">{n.refTitle}</span>
                {n.moodLabel && <span className="kdrama-notes-history__mood">{n.moodLabel}</span>}
                <p className="kdrama-notes-history__text">{n.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
