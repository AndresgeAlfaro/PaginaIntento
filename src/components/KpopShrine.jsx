import { useState } from 'react'
import { ATEEZ_MEMBERS, BTS_MEMBERS } from '../data/content'

export function KpopShrine() {
  const [bts, setBts] = useState(null)
  const [at, setAt] = useState(null)

  return (
    <section id="kpop" className="section kpop-section">
      <h2 className="section-title">Tu rincón K-pop 💜</h2>
      <p className="section-lead">
        BTS y ATEEZ: elige a alguien y deja que la página lo celebre un momento.
      </p>

      <h3 className="kpop-block-title">BTS</h3>
      <div className="member-grid">
        {BTS_MEMBERS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`member-card card ${bts === m.id ? 'member-card--on' : ''}`}
            onClick={() => setBts(m.id)}
          >
            <span className="member-emoji">{m.emoji}</span>
            <span className="member-name">{m.name}</span>
            <span className="member-role">{m.role}</span>
          </button>
        ))}
      </div>
      {bts && (
        <p className="bias-line">
          Mi bias hoy es <strong>{BTS_MEMBERS.find((x) => x.id === bts)?.name}</strong> —{' '}
          {BTS_MEMBERS.find((x) => x.id === bts)?.note}
        </p>
      )}

      <h3 className="kpop-block-title">ATEEZ</h3>
      <div className="member-grid">
        {ATEEZ_MEMBERS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`member-card card ${at === m.id ? 'member-card--on' : ''}`}
            onClick={() => setAt(m.id)}
          >
            <span className="member-emoji">{m.emoji}</span>
            <span className="member-name">{m.name}</span>
            <span className="member-role">{m.role}</span>
          </button>
        ))}
      </div>
      {at && (
        <p className="bias-line">
          Mi bias ATEEZ hoy es <strong>{ATEEZ_MEMBERS.find((x) => x.id === at)?.name}</strong> —{' '}
          {ATEEZ_MEMBERS.find((x) => x.id === at)?.note}
        </p>
      )}
    </section>
  )
}
