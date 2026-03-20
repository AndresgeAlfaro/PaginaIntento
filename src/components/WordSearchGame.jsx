import confetti from 'canvas-confetti'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WORD_SEARCH_PER_GAME, WORD_SEARCH_POOL } from '../data/content'
import {
  SIZE,
  generateWordSearch,
  getCellsInLine,
  getDailySpecialWord,
  lineToString,
  pickWordSearchWords,
} from '../utils/wordSearch'

function cellKey(r, c) {
  return `${r},${c}`
}

function fireWinConfetti() {
  const defaults = {
    spread: 70,
    origin: { y: 0.65 },
    colors: ['#7B2FBE', '#C084FC', '#F472B6', '#fff'],
  }
  const shoot = () => {
    confetti({ ...defaults, particleCount: 55, scalar: 1 })
    confetti({ ...defaults, particleCount: 35, scalar: 0.9, ticks: 120 })
  }
  shoot()
  window.setTimeout(shoot, 280)
  window.setTimeout(shoot, 560)
}

function fireDailyConfetti() {
  const gold = ['#FFD700', '#FFF8DC', '#FFA500', '#F472B6', '#C084FC', '#fff']
  confetti({
    particleCount: 90,
    spread: 100,
    origin: { y: 0.55, x: 0.5 },
    colors: gold,
    scalar: 1.1,
    ticks: 220,
  })
  confetti({
    particleCount: 45,
    angle: 60,
    spread: 55,
    origin: { x: 0, y: 0.65 },
    colors: gold,
  })
  confetti({
    particleCount: 45,
    angle: 120,
    spread: 55,
    origin: { x: 1, y: 0.65 },
    colors: gold,
  })
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function newGameSeed() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(2)
    crypto.getRandomValues(buf)
    return (buf[0] ^ buf[1]) >>> 0
  }
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0
}

function calendarDayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function wordEasyDisplay(w, isFound, easyMode) {
  if (isFound) return w
  if (!easyMode) return w
  if (w.length <= 1) return w
  return `${w[0]}${'·'.repeat(w.length - 1)}`
}

function WordSearchInner({ seed, onNewGame, dailyWord, dayKey }) {
  const words = useMemo(
    () => pickWordSearchWords(seed, WORD_SEARCH_POOL, WORD_SEARCH_PER_GAME, dailyWord),
    [seed, dailyWord],
  )

  const { grid, solutions } = useMemo(() => generateWordSearch(seed, words), [seed, words])

  const [found, setFound] = useState(() => new Set())
  const [highlight, setHighlight] = useState(() => new Set())
  const [preview, setPreview] = useState(() => new Set())
  const [seconds, setSeconds] = useState(0)
  const [easyMode, setEasyMode] = useState(false)
  const [hintWord, setHintWord] = useState(null)
  const hintTimer = useRef(null)

  const isDown = useRef(false)
  const startRef = useRef(null)
  const endRef = useRef(null)
  const previewRef = useRef(new Set())
  const celebratedRef = useRef(false)
  const dailyCelebratedRef = useRef(false)
  const gridRef = useRef(grid)
  const solutionsRef = useRef(solutions)
  const foundRef = useRef(found)
  const wordsRef = useRef(words)

  useEffect(() => {
    gridRef.current = grid
    solutionsRef.current = solutions
    wordsRef.current = words
  }, [grid, solutions, words])

  useEffect(() => {
    foundRef.current = found
  }, [found])

  useEffect(() => {
    dailyCelebratedRef.current = false
  }, [seed, dayKey])

  const won = found.size === words.length

  useEffect(() => {
    if (won) return undefined
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [won, seed])

  useEffect(() => {
    if (!won) {
      celebratedRef.current = false
      return
    }
    if (celebratedRef.current) return
    celebratedRef.current = true
    fireWinConfetti()
  }, [won])

  const clearHintTimer = () => {
    if (hintTimer.current) {
      window.clearTimeout(hintTimer.current)
      hintTimer.current = null
    }
  }

  const showHint = (w) => {
    clearHintTimer()
    setHintWord(w)
    hintTimer.current = window.setTimeout(() => {
      setHintWord(null)
      hintTimer.current = null
    }, 2200)
  }

  const tryMatch = useCallback(
    (r0, c0, r1, c1) => {
      const g = gridRef.current
      const sol = solutionsRef.current
      const ws = wordsRef.current
      const cells = getCellsInLine(r0, c0, r1, c1)
      if (!cells) return
      const str = lineToString(g, cells)
      const rev = str.split('').reverse().join('')
      const match = ws.find((w) => w === str || w === rev)
      if (!match || foundRef.current.has(match)) return
      const path = sol[match] ?? cells
      setFound((prev) => (prev.has(match) ? prev : new Set([...prev, match])))
      setHighlight((prev) => {
        const next = new Set(prev)
        path.forEach(([r, c]) => next.add(cellKey(r, c)))
        return next
      })
      if (match === dailyWord && !dailyCelebratedRef.current) {
        dailyCelebratedRef.current = true
        fireDailyConfetti()
      }
    },
    [dailyWord],
  )

  const clearDragVisual = () => {
    previewRef.current = new Set()
    setPreview(new Set())
  }

  const finishDrag = useCallback(() => {
    if (!isDown.current) return
    const s = startRef.current
    const e = endRef.current
    isDown.current = false
    startRef.current = null
    endRef.current = null
    clearDragVisual()
    if (s && e) {
      const [sr, sc] = s
      const [er, ec] = e
      tryMatch(sr, sc, er, ec)
    }
  }, [tryMatch])

  const onCellPointerDown = (r, c) => {
    isDown.current = true
    startRef.current = [r, c]
    endRef.current = [r, c]
    const init = new Set([cellKey(r, c)])
    previewRef.current = init
    setPreview(init)
  }

  const onCellPointerEnter = (r, c) => {
    if (!isDown.current || !startRef.current) return
    const [sr, sc] = startRef.current
    const cells = getCellsInLine(sr, sc, r, c)
    if (!cells) return
    endRef.current = [r, c]
    const next = new Set(cells.map(([x, y]) => cellKey(x, y)))
    previewRef.current = next
    setPreview(next)
  }

  useEffect(() => {
    const up = () => finishDrag()
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [finishDrag])

  useEffect(() => () => clearHintTimer(), [])

  return (
    <section id="sopa" className="section sopa-section">
      <h2 className="section-title">Sopa de letras 💜</h2>
      <p className="section-lead">
        Arrastra en línea recta. <strong>Palabra del día ✦</strong>:{' '}
        <code className="sopa-daily-code">{dailyWord}</code> — confeti dorado si la encuentras hoy. Modo fácil:
        primera letra; mantén pulsado en la lista para pista.
      </p>

      <div className="card sopa-tools">
        <label className="sopa-easy-label">
          <input type="checkbox" checked={easyMode} onChange={(e) => setEasyMode(e.target.checked)} />
          Modo fácil (primera letra + puntos)
        </label>
      </div>

      <div className="sopa-layout">
        <div
          className="card sopa-grid-wrap"
          onPointerLeave={() => {
            if (isDown.current) finishDrag()
          }}
        >
          <div className="sopa-toolbar">
            <span className="sopa-timer" aria-live="polite">
              ⏱ {formatTime(seconds)}
            </span>
            <button type="button" className="btn-secondary btn-small" onClick={onNewGame}>
              Nueva partida
            </button>
          </div>
          <div
            className="sopa-grid"
            role="grid"
            aria-label="Cuadrícula de letras"
            style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
          >
            {grid.map((row, r) =>
              row.map((ch, c) => {
                const k = cellKey(r, c)
                const isFound = highlight.has(k)
                const isPrev = preview.has(k)
                return (
                  <button
                    type="button"
                    key={k}
                    className={`sopa-cell ${isFound ? 'sopa-cell--found' : ''} ${isPrev && !isFound ? 'sopa-cell--preview' : ''}`}
                    onPointerDown={() => onCellPointerDown(r, c)}
                    onPointerEnter={() => onCellPointerEnter(r, c)}
                  >
                    {ch}
                  </button>
                )
              }),
            )}
          </div>
        </div>
        <aside className="card sopa-words" aria-label="Palabras a encontrar">
          <h3 className="sopa-words__title">Palabras</h3>
          {hintWord && (
            <p className="sopa-hint-pop" role="status">
              Pista: <strong>{hintWord}</strong>
            </p>
          )}
          <ul className="sopa-word-list">
            {words.map((w) => (
              <li key={w}>
                <span
                  className={`sopa-word ${found.has(w) ? 'sopa-word--done' : ''} ${w === dailyWord ? 'sopa-word--daily' : ''}`}
                  onPointerDown={() => {
                    if (found.has(w)) return
                    const t = window.setTimeout(() => showHint(w), 450)
                    const up = () => {
                      window.clearTimeout(t)
                      window.removeEventListener('pointerup', up)
                      window.removeEventListener('pointercancel', up)
                    }
                    window.addEventListener('pointerup', up, { once: true })
                    window.addEventListener('pointercancel', up, { once: true })
                  }}
                  role="group"
                >
                  <span className="sopa-word__box" aria-hidden>
                    {found.has(w) ? '☑' : '☐'}
                  </span>
                  <span className="sopa-word__text">
                    {wordEasyDisplay(w, found.has(w), easyMode && !found.has(w))}
                  </span>
                  {w === dailyWord && !found.has(w) && (
                    <span className="sopa-word__star" title="Palabra del día">
                      ✦
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      {won && (
        <div className="win-banner" role="status">
          ¡Lo lograste! 🎉
        </div>
      )}
    </section>
  )
}

export function WordSearchGame() {
  const [seed, setSeed] = useState(() => newGameSeed())
  const [dayKey, setDayKey] = useState(calendarDayKey)

  useEffect(() => {
    const id = window.setInterval(() => {
      const n = calendarDayKey()
      setDayKey((p) => (p !== n ? n : p))
    }, 60_000)
    return () => window.clearInterval(id)
  }, [])

  const dailyWord = getDailySpecialWord(WORD_SEARCH_POOL)

  return (
    <WordSearchInner
      key={`${seed}-${dayKey}`}
      seed={seed}
      dayKey={dayKey}
      dailyWord={dailyWord}
      onNewGame={() => setSeed(newGameSeed())}
    />
  )
}
