import type { Ride } from '../../types/ride'
import { addDays, startOfDay } from '../../utils/date'

export interface DayBucket {
  date: Date
  counts: Map<string, number>
  total: number
}

export function bucketRidesByDay(
  rides: Ride[],
  start: Date,
  end: Date,
): DayBucket[] {
  const from = startOfDay(start)
  const to = startOfDay(end)
  const buckets = new Map<number, DayBucket>()

  for (let d = from; d.getTime() <= to.getTime(); d = addDays(d, 1)) {
    buckets.set(d.getTime(), { date: new Date(d), counts: new Map(), total: 0 })
  }

  for (const ride of rides) {
    const key = startOfDay(ride.timestamp).getTime()
    const bucket = buckets.get(key)
    if (!bucket) continue
    const line = ride.line || 'Unknown'
    bucket.counts.set(line, (bucket.counts.get(line) ?? 0) + 1)
    bucket.total += 1
  }

  return Array.from(buckets.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  )
}

function niceStep(rough: number): number {
  if (rough <= 0) return 1
  const exponent = Math.floor(Math.log10(rough))
  const magnitude = 10 ** exponent
  const residual = rough / magnitude
  let niceResidual: number
  if (residual <= 1) niceResidual = 1
  else if (residual <= 2) niceResidual = 2
  else if (residual <= 5) niceResidual = 5
  else niceResidual = 10
  return niceResidual * magnitude
}

export function computeYTicks(maxValue: number, targetCount = 4) {
  if (maxValue <= 0) return { ticks: [0, 1], niceMax: 1 }
  const step = niceStep(maxValue / Math.max(targetCount - 1, 1))
  const top = Math.max(Math.ceil(maxValue / step) * step, step)
  const ticks: number[] = []
  for (let v = 0; v <= top; v += step) ticks.push(v)
  return { ticks, niceMax: top }
}

export function computeDateTickInterval(dayCount: number): number {
  const target = 7
  const rough = Math.ceil(dayCount / target)
  const niceIntervals = [1, 2, 5, 7, 10, 14, 21, 30, 60]
  return niceIntervals.find((n) => n >= rough) ?? 90
}
