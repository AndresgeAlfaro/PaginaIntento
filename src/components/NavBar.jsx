import { NAV_ENTRIES } from '../sectionConfig'
import { useSectionNav } from '../SectionNavContext'

export function NavBar() {
  const { activeSection, navigate } = useSectionNav()

  return (
    <nav className="top-nav" aria-label="Secciones">
      <button type="button" className="top-nav__brand top-nav__brand-btn" onClick={() => navigate('hero')}>
        Para Ti 💜
      </button>
      <ul className="top-nav__links">
        {NAV_ENTRIES.map((entry) => {
          const isActive = entry.section === activeSection
          const key = entry.scrollToId ? `${entry.section}-${entry.scrollToId}` : entry.section
          return (
            <li key={key}>
              <button
                type="button"
                className={`top-nav__link ${isActive ? 'top-nav__link--active' : ''}`}
                title={entry.label}
                onClick={() => navigate(entry.section, entry.scrollToId)}
              >
                <span className="top-nav__icon">{entry.icon}</span>
                <span className="top-nav__text">{entry.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
