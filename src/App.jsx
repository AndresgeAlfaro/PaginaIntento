import './App.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AffirmationsCard } from './components/AffirmationsCard'
import { CustomCursor } from './components/CustomCursor'
import { DiarySection } from './components/DiarySection'
import { EnvelopeSection } from './components/EnvelopeSection'
import { HeroSection } from './components/HeroSection'
import { KdramaSection } from './components/KdramaSection'
import { KittyCorner } from './components/KittyCorner'
import { KpopShrine } from './components/KpopShrine'
import { MusicVibe } from './components/MusicVibe'
import { NavBar } from './components/NavBar'
import { QuizSection } from './components/QuizSection'
import { SurpriseFab } from './components/SurpriseFab'
import { WellnessSection } from './components/WellnessSection'
import { WordSearchGame } from './components/WordSearchGame'
import { SECTION_KEYS } from './sectionConfig'
import { SectionNavContext } from './SectionNavContext'

const PANELS = {
  hero: <HeroSection />,
  sobres: <EnvelopeSection />,
  kpop: <KpopShrine />,
  kdrama: <KdramaSection />,
  kitty: <KittyCorner />,
  diario: <DiarySection />,
  bienestar: <WellnessSection />,
  sopa: <WordSearchGame />,
  quiz: <QuizSection />,
  afirmaciones: <AffirmationsCard />,
  musica: <MusicVibe />,
}

function App() {
  const [activeSection, setActiveSection] = useState('hero')
  const [scrollToId, setScrollToId] = useState(null)

  const navigate = useCallback((section, anchorId = null) => {
    if (!SECTION_KEYS.includes(section)) return
    setActiveSection(section)
    setScrollToId(anchorId || null)
    if (!anchorId) {
      queueMicrotask(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
      })
    }
  }, [])

  useEffect(() => {
    if (!scrollToId) return undefined
    const t = window.setTimeout(() => {
      document.getElementById(scrollToId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setScrollToId(null)
    }, 120)
    return () => window.clearTimeout(t)
  }, [activeSection, scrollToId])

  const navValue = useMemo(() => ({ activeSection, navigate }), [activeSection, navigate])

  return (
    <SectionNavContext.Provider value={navValue}>
      <div className="app">
        <CustomCursor />
        <div className="bg-mesh" aria-hidden />
        <div className="bg-noise" aria-hidden />
        <div className="bg-floaters" aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="bg-floater">
              {i % 3 === 0 ? '🐱' : i % 3 === 1 ? '⭐' : '✨'}
            </span>
          ))}
        </div>
        <NavBar />
        <main className="main main--sections">
          <div className="section-panel" key={activeSection}>
            {PANELS[activeSection]}
          </div>
          <footer className="footer">
            Hecho con mucho cariño 💜 Que tu día tenga al menos un momento suave.
          </footer>
        </main>
        <SurpriseFab />
      </div>
    </SectionNavContext.Provider>
  )
}

export default App
