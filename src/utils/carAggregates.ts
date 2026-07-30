import type { Ride } from '../types/ride'

export interface CarAggregate {
  carNumber: string
  count: number
  line: string
  carType: string
  lastRidden: Date
}

function topKey(counts: Map<string, number>, fallback: string): string {
  let top = fallback
  let topCount = -1
  for (const [key, count] of counts) {
    if (count > topCount) {
      top = key
      topCount = count
    }
  }
  return top
}

export function computeCarAggregates(rides: Ride[]): Map<string, CarAggregate> {
  const byCar = new Map<
    string,
    CarAggregate & { lineCounts: Map<string, number>; typeCounts: Map<string, number> }
  >()

  for (const ride of rides) {
    let agg = byCar.get(ride.carNumber)
    if (!agg) {
      agg = {
        carNumber: ride.carNumber,
        count: 0,
        line: ride.line,
        carType: ride.carType,
        lastRidden: ride.timestamp,
        lineCounts: new Map(),
        typeCounts: new Map(),
      }
      byCar.set(ride.carNumber, agg)
    }
    agg.count += 1
    if (ride.timestamp > agg.lastRidden) agg.lastRidden = ride.timestamp
    if (ride.line) {
      agg.lineCounts.set(ride.line, (agg.lineCounts.get(ride.line) ?? 0) + 1)
    }
    if (ride.carType) {
      agg.typeCounts.set(ride.carType, (agg.typeCounts.get(ride.carType) ?? 0) + 1)
    }
  }

  const result = new Map<string, CarAggregate>()
  for (const [carNumber, agg] of byCar) {
    result.set(carNumber, {
      carNumber,
      count: agg.count,
      line: topKey(agg.lineCounts, agg.line),
      carType: topKey(agg.typeCounts, agg.carType),
      lastRidden: agg.lastRidden,
    })
  }

  return result
}
