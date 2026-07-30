import type { Ride } from '../types/ride'
import { LINES } from '../data/lines'

export interface RepeatCar {
  carNumber: string
  line: string
  count: number
}

export interface OverviewStats {
  totalRides: number
  uniqueCars: number
  linesRidden: number
  linesTotal: number
  mostRepeat: RepeatCar | null
}

export function computeOverviewStats(rides: Ride[]): OverviewStats {
  const carCounts = new Map<string, RepeatCar>()
  const linesSeen = new Set<string>()

  for (const ride of rides) {
    if (ride.line) linesSeen.add(ride.line)

    const existing = carCounts.get(ride.carNumber)
    if (existing) {
      existing.count += 1
    } else {
      carCounts.set(ride.carNumber, {
        carNumber: ride.carNumber,
        line: ride.line,
        count: 1,
      })
    }
  }

  let mostRepeat: RepeatCar | null = null
  for (const car of carCounts.values()) {
    if (!mostRepeat || car.count > mostRepeat.count) mostRepeat = car
  }

  return {
    totalRides: rides.length,
    uniqueCars: carCounts.size,
    linesRidden: linesSeen.size,
    linesTotal: LINES.length,
    mostRepeat,
  }
}
