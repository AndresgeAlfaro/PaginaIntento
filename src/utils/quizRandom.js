/** Entero aleatorio en [0, max) usando crypto si existe. */
function randomUint32() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0]
  }
  return (Math.random() * 0x100000000) >>> 0
}

export function randomInt(max) {
  if (max <= 0) return 0
  return randomUint32() % max
}

/** Copia barajada (Fisher–Yates). */
export function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Elige `count` preguntas distintas: prioriza mezclar categorías cuando el banco lo permite,
 * y rellena al azar si hace falta.
 */
export function pickRandomQuestions(pool, count) {
  if (pool.length <= count) return shuffleArray(pool)

  const byCat = new Map()
  for (const q of pool) {
    if (!byCat.has(q.category)) byCat.set(q.category, [])
    byCat.get(q.category).push(q)
  }

  for (const [c, list] of byCat) {
    byCat.set(c, shuffleArray(list))
  }

  const cats = shuffleArray([...byCat.keys()])
  const picked = []
  let round = 0

  while (picked.length < count) {
    let any = false
    for (const c of cats) {
      if (picked.length >= count) break
      const list = byCat.get(c)
      if (round < list.length) {
        picked.push(list[round])
        any = true
      }
    }
    if (!any) break
    round += 1
  }

  if (picked.length < count) {
    const rest = shuffleArray(pool.filter((q) => !picked.includes(q)))
    for (const q of rest) {
      if (picked.length >= count) break
      picked.push(q)
    }
  }

  return shuffleArray(picked.slice(0, count))
}

/**
 * Baraja las opciones y devuelve el índice correcto nuevo.
 * @param {{ options: string[], correct: number }} q
 */
export function shuffleQuestionOptions(q) {
  const order = shuffleArray([0, 1, 2, 3])
  const options = order.map((i) => q.options[i])
  const correct = order.indexOf(q.correct)
  return { ...q, options, correct }
}
