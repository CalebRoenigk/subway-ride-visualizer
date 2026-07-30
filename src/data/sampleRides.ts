import type { Ride } from '../types/ride'

interface CarTypeRange {
  type: string
  min: number
  max: number
  lines: string[]
}

// Rough real-world R-type car number ranges, used only to make the sample
// data feel plausible until a real Airtable export is wired in.
const CAR_TYPES: CarTypeRange[] = [
  { type: 'R62A', min: 1651, max: 2450, lines: ['1', '2', '3'] },
  { type: 'R142', min: 6301, max: 6899, lines: ['4', '5', '6'] },
  { type: 'R188', min: 7550, max: 7938, lines: ['7'] },
  { type: 'R179', min: 3000, max: 3369, lines: ['A', 'C', 'J', 'Z'] },
  { type: 'R211', min: 4000, max: 4520, lines: ['A', 'C', 'E'] },
  { type: 'R46', min: 5482, max: 5886, lines: ['B', 'D', 'F', 'M'] },
  { type: 'R160', min: 8390, max: 8829, lines: ['F', 'G', 'N', 'Q'] },
  { type: 'R68', min: 2500, max: 2934, lines: ['B', 'D', 'N', 'Q'] },
  { type: 'R143', min: 8143, max: 8342, lines: ['L'] },
  { type: 'R68A', min: 5001, max: 5200, lines: ['N', 'Q', 'R', 'W'] },
]

// Deterministic PRNG so the sample dashboard looks the same on every reload.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateSampleRides(): Ride[] {
  const rand = mulberry32(20260502)
  const now = new Date('2026-05-02T12:03:00')
  const rides: Ride[] = []

  // A handful of "regular" cars ridden repeatedly, so stats like "most
  // repeat rides" have something real to show.
  const regulars = Array.from({ length: 6 }, () => {
    const ct = CAR_TYPES[Math.floor(rand() * CAR_TYPES.length)]
    return {
      carType: ct,
      carNumber: ct.min + Math.floor(rand() * (ct.max - ct.min)),
      line: ct.lines[Math.floor(rand() * ct.lines.length)],
    }
  })

  const totalRides = 180
  for (let i = 0; i < totalRides; i++) {
    const daysAgo = Math.floor(rand() * 150)
    const timestamp = new Date(now.getTime() - daysAgo * 86400000)
    timestamp.setHours(Math.floor(rand() * 20) + 5, Math.floor(rand() * 60))

    const useRegular = rand() < 0.25
    if (useRegular) {
      const r = regulars[Math.floor(rand() * regulars.length)]
      rides.push({
        id: `sample-${i}`,
        carNumber: String(r.carNumber),
        line: r.line,
        carType: r.carType.type,
        timestamp,
      })
      continue
    }

    const ct = CAR_TYPES[Math.floor(rand() * CAR_TYPES.length)]
    const carNumber = ct.min + Math.floor(rand() * (ct.max - ct.min))
    const line = ct.lines[Math.floor(rand() * ct.lines.length)]
    rides.push({
      id: `sample-${i}`,
      carNumber: String(carNumber),
      line,
      carType: ct.type,
      timestamp,
    })
  }

  return rides.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export const SAMPLE_RIDES: Ride[] = generateSampleRides()
