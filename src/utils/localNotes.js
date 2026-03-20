const LS_NOTES = 'para-ti-notas-v1'

export function loadNotes() {
  try {
    const raw = localStorage.getItem(LS_NOTES)
    const p = JSON.parse(raw || '[]')
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

export function addNote(note) {
  const list = loadNotes()
  list.unshift({ ...note, ts: Date.now() })
  localStorage.setItem(LS_NOTES, JSON.stringify(list.slice(0, 500)))
}
