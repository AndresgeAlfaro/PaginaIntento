import { loadNotes } from './localNotes'

const LS_DEDICATORIA = 'para-ti-dedicatoria'
const LS_SOBRES = 'para-ti-sobres'
const LS_DIARIO = 'para-ti-diario-v1'
const LS_KDRAMA_WATCHED = 'para-ti-kdrama-visto'
const LS_QUIZ = 'para-ti-quiz-stats'

function safeJson(raw, fb) {
  try {
    return JSON.parse(raw)
  } catch {
    return fb
  }
}

export function buildFullExportText() {
  const lines = []
  lines.push('══════════════════════════════════════')
  lines.push('  Para Ti 💜 — respaldo local')
  lines.push(`  Generado: ${new Date().toLocaleString('es')}`)
  lines.push('══════════════════════════════════════')
  lines.push('')

  const ded = safeJson(localStorage.getItem(LS_DEDICATORIA), null)
  if (ded?.heading || ded?.subtext) {
    lines.push('── Dedicatoria ──')
    if (ded.heading) lines.push(`Título: ${ded.heading}`)
    if (ded.subtext) lines.push(`Subtítulo: ${ded.subtext}`)
    lines.push('')
  }

  const sobres = safeJson(localStorage.getItem(LS_SOBRES), null)
  if (Array.isArray(sobres) && sobres.length) {
    lines.push('── Sobres “Abrir cuando…” ──')
    sobres.forEach((s, i) => lines.push(`${i + 1}. ${s}`))
    lines.push('')
  }

  const diary = safeJson(localStorage.getItem(LS_DIARIO), [])
  if (Array.isArray(diary) && diary.length) {
    lines.push('── Diario ──')
    for (const e of diary) {
      lines.push(`--- ${new Date(e.ts).toLocaleString('es')}${e.pinned ? ' [FIJADA]' : ''} ---`)
      if (e.title) lines.push(`Título: ${e.title}`)
      lines.push(e.body || '')
      lines.push('')
    }
  }

  const notes = loadNotes()
  if (notes.length) {
    lines.push('── Notas (vídeo / página / k-drama) ──')
    for (const n of notes) {
      lines.push(`[${n.type}] ${n.refTitle || n.refId}`)
      lines.push(new Date(n.ts).toLocaleString('es'))
      if (n.reaction) lines.push(`Reacción: ${n.reaction}`)
      lines.push(n.text || '')
      lines.push('')
    }
  }

  const watched = safeJson(localStorage.getItem(LS_KDRAMA_WATCHED), [])
  if (Array.isArray(watched) && watched.length) {
    lines.push('── K-dramas marcados “ya lo vi” ──')
    watched.forEach((w) => {
      const s = String(w)
      const i = s.indexOf('::')
      lines.push(i > 0 ? `· [${s.slice(0, i)}] ${s.slice(i + 2)}` : `· ${s}`)
    })
    lines.push('')
  }

  const quiz = safeJson(localStorage.getItem(LS_QUIZ), null)
  if (quiz && typeof quiz === 'object') {
    lines.push('── Quiz (mejor puntuación) ──')
    lines.push(JSON.stringify(quiz, null, 2))
    lines.push('')
  }

  lines.push('── Fin del respaldo ──')
  return lines.join('\n')
}

export async function copyExportToClipboard() {
  const text = buildFullExportText()
  await navigator.clipboard.writeText(text)
}

export function downloadExportTxt() {
  const text = buildFullExportText()
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `para-ti-respaldo-${new Date().toISOString().slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(a.href)
}
