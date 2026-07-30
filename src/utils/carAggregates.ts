import type { Ride } from '../types/ride'

export interface CarAggregate {
  carNumber: string
  count: number
  line: string
  lastRidden: Date
}

export function computeCarAggregates(rides: Ride[]): Map<string, CarAggregate> {
  const byCar = new Map<string, CarAggregate & { lineCounts: Map<string, number> }>()

  for (const ride of rides) {
    let agg = byCar.get(ride.carNumber)
    if (!agg) {
      agg = {
        carNumber: ride.carNumber,
        count: 0,
        line: ride.line,
        lastRidden: ride.timestamp,
        lineCounts: new Map(),
      }
      byCar.set(ride.carNumber, agg)
    }
    agg.count += 1
    if (ride.timestamp > agg.lastRidden) agg.lastRidden = ride.timestamp
    if (ride.line) {
      agg.lineCounts.set(ride.line, (agg.lineCounts.get(ride.line) ?? 0) + 1)
    }
  }

  const result = new Map<string, CarAggregate>()
  for (const [carNumber, agg] of byCar) {
    let topLine = agg.line
    let topCount = -1
    for (const [line, count] of agg.lineCounts) {
      if (count > topCount) {
        topLine = line
        topCount = count
      }
    }
    result.set(carNumber, {
      carNumber,
      count: agg.count,
      line: topLine,
      lastRidden: agg.lastRidden,
    })
  }

  return result
}
