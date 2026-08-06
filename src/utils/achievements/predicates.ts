// Pure digit-pattern checks on a car number string. Car numbers are stored
// as strings throughout the data layer (see Ride/FleetRecord), so no
// parseInt round-trip is needed for any of these.

export function digitModeCount(carNumber: string): number {
  const counts = new Map<string, number>()
  for (const ch of carNumber) {
    counts.set(ch, (counts.get(ch) ?? 0) + 1)
  }
  let max = 0
  for (const count of counts.values()) {
    if (count > max) max = count
  }
  return max
}

export function isPalindrome(carNumber: string): boolean {
  return carNumber === [...carNumber].reverse().join('')
}

// Smallest repeating period p (2 <= p < length) such that the string is
// that block repeated to fill its full length, e.g. "4545" -> period 2.
// Deliberately excludes p = 1 (all-identical-digits, e.g. "5555") since
// that's already covered by the repeated-digit family at mode count 4+.
export function hasRepeatingPairPattern(carNumber: string): boolean {
  const len = carNumber.length
  for (let p = 2; p < len; p++) {
    if (len % p !== 0) continue
    const block = carNumber.slice(0, p)
    let matches = true
    for (let i = p; i < len; i += p) {
      if (carNumber.slice(i, i + p) !== block) {
        matches = false
        break
      }
    }
    if (matches) return true
  }
  return false
}

export function isRoundNumber(carNumber: string): boolean {
  return carNumber.endsWith('00')
}

export function isAscendingRun(carNumber: string): boolean {
  if (carNumber.length < 3) return false
  for (let i = 1; i < carNumber.length; i++) {
    if (Number(carNumber[i]) !== Number(carNumber[i - 1]) + 1) return false
  }
  return true
}

export function isDescendingRun(carNumber: string): boolean {
  if (carNumber.length < 3) return false
  for (let i = 1; i < carNumber.length; i++) {
    if (Number(carNumber[i]) !== Number(carNumber[i - 1]) - 1) return false
  }
  return true
}
