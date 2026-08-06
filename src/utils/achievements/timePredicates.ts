// Predicates that need more than a bare car number — ride timing, and a
// ride's position relative to its neighbors in the full sorted history.
import type { Ride } from '../../types/ride'

export function isNightOwl(ride: Ride): boolean {
  const hour = ride.timestamp.getHours()
  return hour >= 0 && hour < 4
}

export function isEarlyBird(ride: Ride): boolean {
  return ride.timestamp.getHours() < 6
}

export function isHighNoon(ride: Ride): boolean {
  return ride.timestamp.getHours() === 12 && ride.timestamp.getMinutes() === 0
}

export function isBackToBack(ride: Ride, index: number, rides: Ride[]): boolean {
  if (index === 0) return false
  const prev = Number(rides[index - 1].carNumber)
  const curr = Number(ride.carNumber)
  return Math.abs(curr - prev) === 1
}

function withinMinutesOf(a: Ride, b: Ride, minutes: number): boolean {
  return Math.abs(a.timestamp.getTime() - b.timestamp.getTime()) <= minutes * 60_000
}

// True when this ride is the third in a row (by time) with all three
// falling within `windowMinutes` of each other.
export function makeRapidTriple(windowMinutes: number) {
  return (ride: Ride, index: number, rides: Ride[]): boolean => {
    if (index < 2) return false
    return withinMinutesOf(ride, rides[index - 2], windowMinutes)
  }
}

// Same line as the immediately preceding ride, logged within 15 minutes —
// doubling back onto the same line right after getting off it.
export function isUTurn(ride: Ride, index: number, rides: Ride[]): boolean {
  if (index === 0) return false
  const prev = rides[index - 1]
  return prev.line === ride.line && withinMinutesOf(ride, prev, 15)
}
