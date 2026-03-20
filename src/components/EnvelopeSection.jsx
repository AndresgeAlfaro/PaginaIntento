import { useCallback, useEffect, useState } from 'react'
import { ENVELOPE_DEFAULT_MESSAGES } from '../data/content'

const LS_KEY = 'para-ti-sobres'

function loadMessages() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return [...ENVELOPE_DEFAULT_MESSAGES]
    const p = JSON.parse(raw)
    if (Array.isArray(p) && p.length >= 3) {
      return p.slice(0, 3).map((s) => String(s))
    }
  } catch {
    /* noop */
  }
  return [...ENVELOPE_DEFAULT_MESSAGES]
}

function saveMessages(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr.slice(0, 3)))
}

export function EnvelopeSection() {
  const [messages, setMessages] = useState(() => loadMessages())
  const [open, setOpen] = useState(() => new Set())
  const [edit, setEdit] = useState(false)
  const [draft, setDraft] = useState(() => loadMessages())

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  const toggle = useCallback((i) => {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }, [])

  const saveEdit = () => {
    const next = draft.map((s) => s.trim()).map((s, i) => s || messages[i] || ENVELOPE_DEFAULT_MESSAGES[i])
    setMessages(next)
    setDraft(next)
    setEdit(false)
  }

  return (
    <section id="sobres" className="section envelope-section">
      <h2 className="section-title">Abrir cuando… 💌</h2>
      <p className="section-lead">
        Tres sobres virtuales. Ábrelos cuando quieras un mimo en texto — o edita los mensajes para que suenen a ti.
      </p>

      <div className="envelope-grid">
        {messages.map((msg, i) => (
          <div key={i} className={`envelope-card card ${open.has(i) ? 'envelope-card--open' : ''}`}>
            <button
              type="button"
              className="envelope-flap"
              onClick={() => toggle(i)}
              aria-expanded={open.has(i)}
            >
              <span className="envelope-flap__emoji" aria-hidden>
                ✉️
              </span>
              <span className="envelope-flap__label">
                {open.has(i) ? 'Cerrar sobre' : `Abrir sobre ${i + 1}`}
              </span>
            </button>
            {open.has(i) && (
              <p className="envelope-message" role="region">
                {msg}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="card envelope-edit">
        <button type="button" className="btn-secondary" onClick={() => setEdit((e) => !e)}>
          {edit ? 'Cerrar edición' : 'Personalizar los 3 mensajes ✏️'}
        </button>
        {edit && (
          <div className="envelope-edit__fields">
            {[0, 1, 2].map((i) => (
              <label key={i} className="envelope-edit__label">
                Mensaje {i + 1}
                <textarea
                  className="envelope-edit__textarea"
                  rows={2}
                  value={draft[i] ?? ''}
                  onChange={(e) => {
                    const next = [...draft]
                    next[i] = e.target.value
                    setDraft(next)
                  }}
                  maxLength={400}
                />
              </label>
            ))}
            <button type="button" className="btn-primary" onClick={saveEdit}>
              Guardar sobres 💜
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
