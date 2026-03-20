import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildFullExportText, copyExportToClipboard, downloadExportTxt } from '../utils/exportData'

const STORAGE_KEY = 'para-ti-diario-v1'

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p.map((e) => ({ ...e, pinned: !!e.pinned })) : []
  } catch {
    return []
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function sortEntries(list) {
  return [...list].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.ts - a.ts
  })
}

export function DiarySection() {
  const [entries, setEntries] = useState(() => sortEntries(loadEntries()))
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinNew, setPinNew] = useState(false)
  const [toast, setToast] = useState('')
  const [exportMsg, setExportMsg] = useState('')

  const sorted = useMemo(() => sortEntries(entries), [entries])

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  const addEntry = useCallback(() => {
    const text = body.trim()
    if (!text) {
      setToast('Escribe algo cuando quieras; no hace falta que sea largo 💜')
      window.setTimeout(() => setToast(''), 3500)
      return
    }
    const id = `d-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const entry = {
      id,
      ts: Date.now(),
      title: title.trim() || undefined,
      body: text,
      pinned: pinNew,
    }
    setEntries((prev) => sortEntries([entry, ...prev]))
    setTitle('')
    setBody('')
    setPinNew(false)
    setToast('Entrada guardada en tu diario (solo en este dispositivo) ✨')
    window.setTimeout(() => setToast(''), 4000)
  }, [body, title, pinNew])

  const remove = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const togglePin = useCallback((id) => {
    setEntries((prev) =>
      sortEntries(prev.map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e))),
    )
  }, [])

  const copyAll = async () => {
    try {
      await copyExportToClipboard()
      setExportMsg('Copiado al portapapeles ✨')
    } catch {
      setExportMsg('No se pudo copiar (permiso del navegador)')
    }
    window.setTimeout(() => setExportMsg(''), 3500)
  }

  return (
    <section id="diario" className="section diary-section">
      <h2 className="section-title">Tu diario secreto 📔</h2>
      <p className="section-lead">Se guarda solo en este navegador.</p>

      <div className="card diary-card">
        <label className="diary-label" htmlFor="diary-title">
          Título (opcional)
        </label>
        <input
          id="diary-title"
          className="diary-input"
          type="text"
          maxLength={120}
          placeholder="Ej. Hoy, Noche…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="diary-label" htmlFor="diary-body">
          Lo que piensas
        </label>
        <textarea
          id="diary-body"
          className="diary-textarea"
          rows={6}
          maxLength={8000}
          placeholder="Sin orden ni juicio."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <label className="diary-pin-label">
          <input type="checkbox" checked={pinNew} onChange={(e) => setPinNew(e.target.checked)} />
          Fijar arriba como “léeme cuando estés mal” 📌
        </label>

        <div className="diary-actions">
          <button type="button" className="btn-primary" onClick={addEntry}>
            Guardar entrada 💜
          </button>
          {toast && <span className="diary-toast">{toast}</span>}
        </div>
      </div>

      <div id="exportar" className="card diary-export-card">
        <h3 className="diary-export__title">Respaldo local 💾</h3>
        <p className="diary-export__lead">
          Diario, notas, dedicatoria, sobres, dramas vistos y quiz — en un solo texto.
        </p>
        <div className="diary-export__btns">
          <button type="button" className="btn-secondary" onClick={copyAll}>
            Copiar todo al portapapeles
          </button>
          <button type="button" className="btn-secondary" onClick={() => downloadExportTxt()}>
            Descargar .txt
          </button>
        </div>
        <button
          type="button"
          className="btn-secondary diary-export__preview"
          onClick={() => {
            const t = buildFullExportText()
            window.alert(
              t.slice(0, 3500) + (t.length > 3500 ? '\n\n… (recortado; descarga para el archivo completo)' : ''),
            )
          }}
        >
          Vista previa (primeros caracteres)
        </button>
        {exportMsg && <p className="diary-export__msg">{exportMsg}</p>}
      </div>

      {sorted.length > 0 && (
        <div className="diary-timeline">
          <h3 className="diary-timeline__title">Entradas</h3>
          <ul className="diary-list">
            {sorted.map((e) => (
              <li key={e.id} className={`diary-entry card ${e.pinned ? 'diary-entry--pinned' : ''}`}>
                <div className="diary-entry__head">
                  <time className="diary-entry__date" dateTime={new Date(e.ts).toISOString()}>
                    {new Date(e.ts).toLocaleString('es', { dateStyle: 'long', timeStyle: 'short' })}
                  </time>
                  <div className="diary-entry__actions">
                    <button
                      type="button"
                      className={`btn-secondary btn-small ${e.pinned ? 'diary-entry__pin--on' : ''}`}
                      onClick={() => togglePin(e.id)}
                    >
                      {e.pinned ? '📌' : 'Fijar'}
                    </button>
                    <button type="button" className="btn-secondary btn-small" onClick={() => remove(e.id)}>
                      Borrar
                    </button>
                  </div>
                </div>
                {e.pinned && <p className="diary-entry__pin-badge">Léeme cuando estés mal 💜</p>}
                {e.title && <h4 className="diary-entry__title">{e.title}</h4>}
                <p className="diary-entry__body">{e.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
