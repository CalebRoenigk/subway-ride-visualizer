export type TimePeriod = 'week' | 'month' | 'year' | 'all'

export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  all: 'All Time',
}

export function getTimePeriodRange(
  period: TimePeriod,
  now: Date,
  earliest: Date | null,
): { start: Date; end: Date } {
  if (period === 'all') {
    return { start: earliest ?? now, end: now }
  }

  if (period === 'week') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return { start, end }
  }

  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { start, end }
  }

  const start = new Date(now.getFullYear(), 0, 1)
  const end = new Date(now.getFullYear(), 11, 31)
  return { start, end }
}
