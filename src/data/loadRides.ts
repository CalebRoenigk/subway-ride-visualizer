import { parseCsv } from '../utils/csv'
import type { Ride } from '../types/ride'

const HEADER_ALIASES: Record<keyof Omit<Ride, 'id'>, string[]> = {
  carNumber: ['car number', 'car #', 'car num', 'car', 'number'],
  line: ['line', 'subway line', 'route'],
  carType: ['car type', 'cartype', 'type'],
  timestamp: [
    'date and time logged',
    'date/time',
    'date and time',
    'datetime',
    'timestamp',
    'date logged',
    'date',
    'ridden date',
  ],
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase()
}

function buildColumnIndex(headerRow: string[]): Partial<Record<keyof Omit<Ride, 'id'>, number>> {
  const normalized = headerRow.map(normalizeHeader)
  const index: Partial<Record<keyof Omit<Ride, 'id'>, number>> = {}

  for (const field of Object.keys(HEADER_ALIASES) as (keyof typeof HEADER_ALIASES)[]) {
    const aliases = HEADER_ALIASES[field]
    const colIndex = normalized.findIndex((h) => aliases.includes(h))
    if (colIndex !== -1) index[field] = colIndex
  }

  return index
}

// Matches Airtable's typical US export format: "11/3/2024 2:27pm" — no
// space before am/pm, which `new Date(...)` fails to parse natively.
const US_DATETIME_RE =
  /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})[,\s]+(\d{1,2}):(\d{2})\s*([ap]m)?$/i

function parseTimestamp(raw: string): Date | null {
  const match = raw.match(US_DATETIME_RE)
  if (match) {
    const [, month, day, yearRaw, hourRaw, minute, meridiem] = match
    let year = Number(yearRaw)
    if (year < 100) year += 2000
    let hour = Number(hourRaw)
    if (meridiem) {
      const isPm = meridiem.toLowerCase() === 'pm'
      hour = (hour % 12) + (isPm ? 12 : 0)
    }
    const date = new Date(year, Number(month) - 1, Number(day), hour, Number(minute))
    if (!Number.isNaN(date.getTime())) return date
  }

  const direct = new Date(raw)
  if (!Number.isNaN(direct.getTime())) return direct
  return null
}

export function parseRidesCsv(csvText: string): Ride[] {
  const rows = parseCsv(csvText)
  if (rows.length < 2) return []

  const [headerRow, ...dataRows] = rows
  const columns = buildColumnIndex(headerRow)

  if (columns.carNumber === undefined || columns.timestamp === undefined) {
    throw new Error(
      'CSV is missing a recognizable "Car Number" or "Date and Time" column.',
    )
  }

  const rides: Ride[] = []
  dataRows.forEach((row, i) => {
    const carNumber = row[columns.carNumber!]?.trim()
    const rawTimestamp = row[columns.timestamp!]?.trim()
    if (!carNumber || !rawTimestamp) return

    const timestamp = parseTimestamp(rawTimestamp)
    if (!timestamp) return

    rides.push({
      id: `row-${i}`,
      carNumber,
      line: columns.line !== undefined ? row[columns.line]?.trim() ?? '' : '',
      carType:
        columns.carType !== undefined ? row[columns.carType]?.trim() ?? '' : '',
      timestamp,
    })
  })

  return rides.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

export interface RidesResult {
  rides: Ride[]
  isSample: boolean
}

export async function loadRides(): Promise<RidesResult> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/rides.csv`)
    if (res.ok) {
      const text = await res.text()
      const rides = parseRidesCsv(text)
      if (rides.length > 0) return { rides, isSample: false }
    }
  } catch {
    // fall through to sample data
  }

  const { SAMPLE_RIDES } = await import('./sampleRides')
  return { rides: SAMPLE_RIDES, isSample: true }
}
