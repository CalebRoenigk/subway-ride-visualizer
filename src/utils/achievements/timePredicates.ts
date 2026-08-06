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

export function isBackToBack(ride: Ride, index: number, rides: Ride[]): boolean {
  if (index === 0) return false
  const prev = Number(rides[index - 1].carNumber)
  const curr = Number(ride.carNumber)
  return Math.abs(curr - prev) === 1
}
