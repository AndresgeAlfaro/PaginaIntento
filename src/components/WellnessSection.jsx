import { useCallback, useEffect, useState } from 'react'

const PHASES = [
  { key: 'inhale', label: 'Inhala', sec: 4 },
  { key: 'hold', label: 'Aguanta', sec: 7 },
  { key: 'exhale', label: 'Exhala', sec: 8 },
]

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fn = () => setReduced(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return reduced
}

export function WellnessSection() {
  const reduced = useReducedMotion()
  const [mode, setMode] = useState('breathe')
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [secLeft, setSecLeft] = useState(PHASES[0].sec)
  const [breatheOn, setBreatheOn] = useState(false)
  const [timerLeft, setTimerLeft] = useState(300)
  const [timerRun, setTimerRun] = useState(false)

  useEffect(() => {
    if (!breatheOn || mode !== 'breathe') return undefined
    let phase = 0
    let left = PHASES[0].sec
    const id = window.setInterval(() => {
      left -= 1
      if (left <= 0) {
        phase = (phase + 1) % PHASES.length
        left = PHASES[phase].sec
        setPhaseIdx(phase)
      }
      setSecLeft(left)
    }, 1000)
    return () => window.clearInterval(id)
  }, [breatheOn, mode])

  useEffect(() => {
    if (!timerRun || mode !== 'timer') return undefined
    const id = window.setInterval(() => {
      setTimerLeft((s) => {
        if (s <= 1) {
          setTimerRun(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [timerRun, mode])

  const startTimer = useCallback(() => {
    setTimerLeft(300)
    setTimerRun(true)
  }, [])

  const fmt = (s) => {
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}:${String(r).padStart(2, '0')}`
  }

  const phase = PHASES[phaseIdx]

  return (
    <section id="bienestar" className="section wellness-section">
      <h2 className="section-title">Un momento contigo 🌙</h2>
      <p className="section-lead">
        Sin sonido obligatorio. Respiración 4-7-8 o 5 minutos contigo. Si reduces movimiento en el sistema, la
        animación se calma.
      </p>

      <div className="wellness-tabs">
        <button
          type="button"
          className={`wellness-tab ${mode === 'breathe' ? 'wellness-tab--on' : ''}`}
          onClick={() => {
            setMode('breathe')
            setTimerRun(false)
          }}
        >
          Respiración 4-7-8
        </button>
        <button
          type="button"
          className={`wellness-tab ${mode === 'timer' ? 'wellness-tab--on' : ''}`}
          onClick={() => {
            setMode('timer')
            setBreatheOn(false)
          }}
        >
          5 min contigo
        </button>
      </div>

      {mode === 'breathe' && (
        <div className="card wellness-card">
          <p className="wellness-live" aria-live="polite">
            {breatheOn ? `${phase.label}… ${secLeft}` : 'Pulsa empezar cuando quieras.'}
          </p>
          <div
            className={`wellness-circle ${breatheOn ? `wellness-circle--${phase.key}` : ''} ${reduced ? 'wellness-circle--reduced' : ''}`}
            aria-hidden
          />
          <div className="wellness-btns">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setBreatheOn((o) => {
                  if (o) return false
                  setPhaseIdx(0)
                  setSecLeft(PHASES[0].sec)
                  return true
                })
              }}
            >
              {breatheOn ? 'Pausar' : 'Empezar'}
            </button>
          </div>
        </div>
      )}

      {mode === 'timer' && (
        <div className="card wellness-card">
          <p className="wellness-timer-display" aria-live="polite">
            {fmt(timerLeft)}
          </p>
          <p className="wellness-timer-hint">
            {timerLeft === 0 && !timerRun ? 'Listo. Un abrazo mental 💜' : 'Este tiempo es solo tuyo.'}
          </p>
          <div className="wellness-btns">
            {!timerRun ? (
              <button type="button" className="btn-primary" onClick={startTimer}>
                Empezar 5 min
              </button>
            ) : (
              <button type="button" className="btn-secondary" onClick={() => setTimerRun(false)}>
                Pausar
              </button>
            )}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setTimerRun(false)
                setTimerLeft(300)
              }}
            >
              Reiniciar
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
