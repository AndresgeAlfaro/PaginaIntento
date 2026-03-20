import { createContext, useContext } from 'react'

export const SectionNavContext = createContext(null)

export function useSectionNav() {
  const v = useContext(SectionNavContext)
  if (!v) {
    throw new Error('useSectionNav debe usarse dentro del proveedor de secciones')
  }
  return v
}
