import { useCallback, useMemo, useState } from 'react'
import {
  LATEST_ATEEZ_VIDEOS,
  LATEST_BTS_VIDEOS,
  MOOD_VIBES,
  YOUTUBE_PLAYLIST_IDS,
} from '../data/content'
import { addNote, loadNotes } from '../utils/localNotes'

const PAGE_TOPIC = {
  id: '__pagina__',
  embedId: '',
  title: 'Toda la página Para Ti 💜',
  buttonLabel: 'Toda la página',
}

function youtubeWatchUrl(embedId) {
  return `https://www.youtube.com/watch?v=${embedId}`
}

/** Embed estable: dominio nocookie + params que suelen evitar “vídeo no disponible” en iframes. */
function embedSrc(videoId) {
  const q = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })
  return `https://www.youtube-nocookie.com/embed/${videoId}?${q.toString()}`
}

function playlistEmbedSrc(listId) {
  const q = new URLSearchParams({
    list: listId,
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })
  return `https://www.youtube-nocookie.com/embed/videoseries?${q.toString()}`
}

function filterMusicNotes() {
  return loadNotes().filter((n) => n.type === 'video' || n.type === 'page')
}

export function MusicVibe() {
  const catalog = useMemo(() => {
    const m = new Map()
    for (const v of MOOD_VIBES) {
      m.set(v.id, {
        id: v.id,
        embedId: v.embedId,
        title: v.title,
        buttonLabel: v.label,
        group: 'mood',
      })
    }
    for (const v of LATEST_BTS_VIDEOS) {
      m.set(v.id, {
        id: v.id,
        embedId: v.embedId,
        title: v.title,
        buttonLabel: `${v.chipLabel} (${v.year})`,
        group: 'bts',
      })
    }
    for (const v of LATEST_ATEEZ_VIDEOS) {
      m.set(v.id, {
        id: v.id,
        embedId: v.embedId,
        title: v.title,
        buttonLabel: `${v.chipLabel} (${v.year})`,
        group: 'ateez',
      })
    }
    return m
  }, [])

  const [activeId, setActiveId] = useState(MOOD_VIBES[0].id)
  const current = catalog.get(activeId) ?? catalog.get(MOOD_VIBES[0].id)

  const [opinionTopic, setOpinionTopic] = useState('video')
  const [draft, setDraft] = useState('')
  const [reaction, setReaction] = useState('')
  const [savedMsg, setSavedMsg] = useState('')
  const [history, setHistory] = useState(() => filterMusicNotes())

  const refreshHistory = useCallback(() => {
    setHistory(filterMusicNotes())
  }, [])

  const submitOpinion = useCallback(() => {
    const text = draft.trim()
    if (!text) {
      setSavedMsg('Escribe algo cuando quieras 💜')
      window.setTimeout(() => setSavedMsg(''), 3200)
      return
    }
    const aboutVideo = opinionTopic === 'video'
    addNote({
      type: aboutVideo ? 'video' : 'page',
      refId: aboutVideo ? current.id : PAGE_TOPIC.id,
      refTitle: aboutVideo ? current.title : PAGE_TOPIC.title,
      text,
      reaction: reaction || undefined,
    })
    setDraft('')
    setReaction('')
    setSavedMsg('Guardado localmente ✨')
    refreshHistory()
    window.setTimeout(() => setSavedMsg(''), 4000)
  }, [draft, reaction, opinionTopic, current, refreshHistory])

  const chipClass = (id) => `video-chip ${activeId === id ? 'video-chip--active' : ''}`

  return (
    <section id="musica" className="section music-section">
      <h2 className="section-title">¿Cómo te sientes hoy?</h2>
      <p className="section-lead">Vídeos oficiales embebidos; abajo BTS y ATEEZ recientes 💜</p>

      <h3 className="music-subtitle">Por mood</h3>
      <div className="video-chip-row">
        {MOOD_VIBES.map((v) => (
          <button key={v.id} type="button" className={chipClass(v.id)} onClick={() => setActiveId(v.id)}>
            {v.label}
          </button>
        ))}
      </div>

      <h3 className="music-subtitle">BTS — recientes</h3>
      <div className="video-chip-row video-chip-row--scroll">
        {LATEST_BTS_VIDEOS.map((v) => (
          <button key={v.id} type="button" className={chipClass(v.id)} onClick={() => setActiveId(v.id)}>
            {v.chipLabel}
            <span className="video-chip__year">{v.year}</span>
          </button>
        ))}
      </div>

      <h3 className="music-subtitle">ATEEZ — recientes</h3>
      <div className="video-chip-row video-chip-row--scroll">
        {LATEST_ATEEZ_VIDEOS.map((v) => (
          <button key={v.id} type="button" className={chipClass(v.id)} onClick={() => setActiveId(v.id)}>
            {v.chipLabel}
            <span className="video-chip__year">{v.year}</span>
          </button>
        ))}
      </div>

      <p className="vibe-now">{current.title}</p>
      <div className="embed-wrap">
        <iframe
          key={current.embedId}
          title={current.title}
          src={embedSrc(current.embedId)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      {(current.group === 'bts' || current.group === 'ateez') && (
        <>
          <h3 className="music-subtitle">Playlist de fondo</h3>
          <p className="music-playlist-lead">
            Si no carga la lista, usa «Abrir en YouTube» arriba: a veces YouTube restringe playlists en páginas
            externas según región o cuenta.
          </p>
          <div className="embed-wrap embed-wrap--playlist">
            <iframe
              title={`Playlist ${current.group === 'bts' ? 'BTS' : 'ATEEZ'}`}
              src={playlistEmbedSrc(YOUTUBE_PLAYLIST_IDS[current.group])}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </>
      )}

      <p className="youtube-outlink">
        <a href={youtubeWatchUrl(current.embedId)} target="_blank" rel="noreferrer noopener">
          Abrir en YouTube 💬
        </a>
      </p>

      <div id="opinion" className="card opinion-card">
        <h3 className="opinion-title">¿Qué te ha parecido? 💜</h3>
        <p className="opinion-lead">Se guarda en este dispositivo con tus otras notas.</p>

        <fieldset className="opinion-fieldset">
          <legend className="opinion-legend">Comentar sobre</legend>
          <label className="opinion-radio">
            <input
              type="radio"
              name="opinion-about"
              checked={opinionTopic === 'video'}
              onChange={() => setOpinionTopic('video')}
            />
            El vídeo: {current.title}
          </label>
          <label className="opinion-radio">
            <input
              type="radio"
              name="opinion-about"
              checked={opinionTopic === 'page'}
              onChange={() => setOpinionTopic('page')}
            />
            {PAGE_TOPIC.title}
          </label>
        </fieldset>

        <div className="reaction-row" aria-label="Reacción rápida">
          {['😭', '🥰', '🔥', '😌', '💜'].map((e) => (
            <button
              key={e}
              type="button"
              className={`reaction-btn ${reaction === e ? 'reaction-btn--on' : ''}`}
              onClick={() => setReaction((r) => (r === e ? '' : e))}
            >
              {e}
            </button>
          ))}
        </div>

        <label className="opinion-label" htmlFor="opinion-text">
          Tu mensaje
        </label>
        <textarea
          id="opinion-text"
          className="opinion-textarea"
          rows={4}
          placeholder="Lo que sientas…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
        />

        <div className="opinion-actions">
          <button type="button" className="btn-primary" onClick={submitOpinion}>
            Guardar mi opinión ✨
          </button>
          {savedMsg && <span className="opinion-saved">{savedMsg}</span>}
        </div>

        {history.length > 0 && (
          <div className="opinion-history">
            <h4 className="opinion-history__title">Lo que dejaste antes</h4>
            <ul className="opinion-history__list">
              {history.slice(0, 8).map((h) => (
                <li key={`${h.refId}-${h.ts}`} className="opinion-history__item">
                  <span className="opinion-history__badge">{h.type === 'page' ? '📄 Página' : '🎵 Vídeo'}</span>
                  <span className="opinion-history__meta">
                    {new Date(h.ts).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}
                    {h.reaction ? ` · ${h.reaction}` : ''}
                  </span>
                  <span className="opinion-history__about">{h.refTitle}</span>
                  <p className="opinion-history__text">{h.text}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
