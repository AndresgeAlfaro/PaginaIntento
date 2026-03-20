const SIZE = 12

export function createRng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function shuffle(arr, rng) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

function canPlace(grid, word, r, c, dr, dc) {
  for (let i = 0; i < word.length; i++) {
    const rr = r + dr * i
    const cc = c + dc * i
    if (rr < 0 || rr >= SIZE || cc < 0 || cc >= SIZE) return false
    const cell = grid[rr][cc]
    if (cell !== '' && cell !== word[i]) return false
  }
  return true
}

function placeWord(grid, word, r, c, dr, dc) {
  const cells = []
  for (let i = 0; i < word.length; i++) {
    const rr = r + dr * i
    const cc = c + dc * i
    grid[rr][cc] = word[i]
    cells.push([rr, cc])
  }
  return cells
}

function tryPlaceAll(words, rng) {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(''))
  const solutions = {}

  for (const word of words) {
    let placed = false
    const dirs = shuffle(DIRECTIONS, rng)
    for (let t = 0; t < 1200 && !placed; t++) {
      const dr = dirs[t % dirs.length][0]
      const dc = dirs[t % dirs.length][1]
      const r = Math.floor(rng() * SIZE)
      const c = Math.floor(rng() * SIZE)
      if (canPlace(grid, word, r, c, dr, dc)) {
        solutions[word] = placeWord(grid, word, r, c, dr, dc)
        placed = true
      }
    }
    if (!placed) {
      outer: for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          for (const [dr, dc] of DIRECTIONS) {
            if (canPlace(grid, word, r, c, dr, dc)) {
              solutions[word] = placeWord(grid, word, r, c, dr, dc)
              placed = true
              break outer
            }
          }
        }
      }
    }
    if (!placed) return null
  }

  return { grid, solutions }
}

function validPoolWords(pool) {
  return [...new Set(pool)].filter(
    (w) =>
      typeof w === 'string' &&
      w.length >= 3 &&
      w.length <= SIZE &&
      /^[A-Z]+$/.test(w),
  )
}

export function getDailySpecialWord(pool) {
  const d = new Date()
  const dayIndex = (d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate()) >>> 0
  const ok = validPoolWords(pool)
  if (ok.length === 0) return 'LOVE'
  return ok[dayIndex % ok.length]
}

export function pickWordSearchWords(seed, pool, count = 12, mustInclude = null) {
  const rng = createRng((seed ^ 0xfaceb00c) >>> 0)
  const ok = validPoolWords(pool)
  if (ok.length < count) {
    throw new Error('Pool de palabras demasiado pequeño')
  }
  if (mustInclude && ok.includes(mustInclude)) {
    const rest = shuffle(
      ok.filter((w) => w !== mustInclude),
      rng,
    )
    return [mustInclude, ...rest.slice(0, count - 1)]
  }
  const shuffled = shuffle(ok, rng)
  return shuffled.slice(0, count)
}

export function generateWordSearch(seed, words) {
  for (let bump = 0; bump < 200; bump++) {
    const rng = createRng(seed + bump * 7919)
    const ordered = shuffle([...words], rng).sort((a, b) => b.length - a.length)
    const placed = tryPlaceAll(ordered, rng)
    if (!placed) continue

    const { grid, solutions } = placed
    fillNoiseCells(grid, seed, bump, words)
    return { grid, solutions }
  }

  const ordered = [...words].sort((a, b) => b.length - a.length)
  let placedLast = tryPlaceAll(ordered, createRng(42))
  if (!placedLast) placedLast = tryPlaceAll(ordered, createRng(999_983))
  if (!placedLast) {
    throw new Error('No se pudo generar la sopa de letras')
  }
  const { grid, solutions } = placedLast
  fillNoiseCells(grid, 42, 0, words)
  return { grid, solutions }
}

const NOISE_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'AEIOUAEIOUAEIOU' + 'RSTLNRSTLN'

function fillNoiseCells(grid, seed, bump, gameWords) {
  const fillRng = createRng(((seed + bump * 7919) ^ 0x9e3779b9) >>> 0)
  const empties = []
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === '') empties.push([r, c])
    }
  }
  shuffle(empties, fillRng)
  for (let i = 0; i < empties.length; i++) {
    const [r, c] = empties[i]
    const roll = fillRng()
    let ch = NOISE_ALPHABET[Math.floor(roll * NOISE_ALPHABET.length)] ?? 'X'
    if (fillRng() < 0.12 && gameWords.length > 0) {
      const w = gameWords[Math.floor(fillRng() * gameWords.length)]
      ch = w[Math.floor(fillRng() * w.length)]
    }
    grid[r][c] = ch
  }
}

export function getCellsInLine(r0, c0, r1, c1) {
  const dr = r1 - r0
  const dc = c1 - c0
  if (dr === 0 && dc === 0) return [[r0, c0]]
  const steps = Math.max(Math.abs(dr), Math.abs(dc))
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null
  const stepR = dr === 0 ? 0 : dr / Math.abs(dr)
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc)
  const cells = []
  for (let i = 0; i <= steps; i++) {
    cells.push([r0 + stepR * i, c0 + stepC * i])
  }
  return cells
}

export function lineToString(grid, cells) {
  return cells.map(([r, c]) => grid[r][c]).join('')
}

export { SIZE }
