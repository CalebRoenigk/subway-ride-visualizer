export type RangePresetId =
  | 'mtd'
  | 'ytd'
  | 'lastMonth'
  | 'lastYear'
  | 'recent3'
  | 'recent6'
  | 'recent12'
  | 'allTime'
  | 'custom'

export const RANGE_PRESET_ORDER: RangePresetId[] = [
  'mtd',
  'ytd',
  'lastMonth',
  'lastYear',
  'recent3',
  'recent6',
  'recent12',
  'allTime',
  'custom',
]

export const RANGE_PRESET_LABELS: Record<RangePresetId, string> = {
  mtd: 'Month to date',
  ytd: 'Year to date',
  lastMonth: 'Last month',
  lastYear: 'Last year',
  recent3: 'Recent 3 months',
  recent6: 'Recent 6 months',
  recent12: 'Recent 12 months',
  allTime: 'All time',
  custom: 'Custom',
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function shiftMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, date.getDate())
}

// A named preset's range, computed against the real current date — `null`
// for 'custom' since that range comes from the user's own calendar/input
// selection rather than a formula.
export function getPresetRange(
  preset: RangePresetId,
  today: Date,
  earliest: Date | null,
): { start: Date; end: Date } | null {
  const ref = startOfDay(today)
  const y = ref.getFullYear()
  const m = ref.getMonth()

  switch (preset) {
    case 'mtd':
      return { start: new Date(y, m, 1), end: endOfDay(ref) }
    case 'ytd':
      return { start: new Date(y, 0, 1), end: endOfDay(ref) }
    case 'lastMonth': {
      const start = new Date(y, m - 1, 1)
      const end = new Date(y, m, 0)
      return { start, end: endOfDay(end) }
    }
    case 'lastYear':
      return { start: new Date(y - 1, 0, 1), end: endOfDay(new Date(y - 1, 11, 31)) }
    case 'recent3':
      return { start: startOfDay(shiftMonths(ref, -3)), end: endOfDay(ref) }
    case 'recent6':
      return { start: startOfDay(shiftMonths(ref, -6)), end: endOfDay(ref) }
    case 'recent12':
      return { start: startOfDay(shiftMonths(ref, -12)), end: endOfDay(ref) }
    case 'allTime':
      return { start: earliest ? startOfDay(earliest) : ref, end: endOfDay(ref) }
    case 'custom':
      return null
  }
}

export function formatRangeLabel(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromDateInputValue(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const [, y, m, d] = match
  return new Date(Number(y), Number(m) - 1, Number(d))
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
