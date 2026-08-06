import type { Ride } from '../../types/ride'
import type { FleetRecord } from '../../data/loadFleet'
import { buildCarTypeIndex } from '../../data/loadFleet'
import { LINES } from '../../data/lines'
import { addDays, isWeekend, startOfDay } from '../date'
import type { AchievementsSummary, BadgeState, BadgeStatus } from '../../types/achievement'
import { buildCatalog } from './catalog'
import { digitModeCount } from './predicates'
import { levelForXp } from './level'

interface FamilyResult {
  finalValue: number
  earnedAtByThreshold: Map<number, Date>
}

function replayCumulativeCount(sortedRides: Ride[], thresholds: number[]): FamilyResult {
  const finalValue = sortedRides.length
  const earnedAtByThreshold = new Map<number, Date>()
  for (const t of thresholds) {
    if (finalValue >= t) earnedAtByThreshold.set(t, sortedRides[t - 1].timestamp)
  }
  return { finalValue, earnedAtByThreshold }
}

function replayRunningMax(
  sortedRides: Ride[],
  thresholds: number[],
  score: (ride: Ride) => number,
): FamilyResult {
  const sortedThresholds = [...thresholds].sort((a, b) => a - b)
  const earnedAtByThreshold = new Map<number, Date>()
  let runningMax = 0
  let nextIdx = 0
  for (const ride of sortedRides) {
    const value = score(ride)
    if (value > runningMax) runningMax = value
    while (nextIdx < sortedThresholds.length && runningMax >= sortedThresholds[nextIdx]) {
      earnedAtByThreshold.set(sortedThresholds[nextIdx], ride.timestamp)
      nextIdx++
    }
  }
  return { finalValue: runningMax, earnedAtByThreshold }
}

function replayFirstSeenMilestones(
  sortedRides: Ride[],
  thresholds: number[],
  onFirstSeen: (ride: Ride) => number | null,
): FamilyResult {
  const seen = new Set<string>()
  const sortedThresholds = [...thresholds].sort((a, b) => a - b)
  const earnedAtByThreshold = new Map<number, Date>()
  let finalValue = 0
  let nextIdx = 0
  for (const ride of sortedRides) {
    if (seen.has(ride.carNumber)) continue
    seen.add(ride.carNumber)
    const value = onFirstSeen(ride)
    if (value === null) continue
    finalValue = value
    while (nextIdx < sortedThresholds.length && finalValue >= sortedThresholds[nextIdx]) {
      earnedAtByThreshold.set(sortedThresholds[nextIdx], ride.timestamp)
      nextIdx++
    }
  }
  return { finalValue, earnedAtByThreshold }
}

function firstMatchingRide(
  sortedRides: Ride[],
  match: (ride: Ride, index: number, rides: Ride[]) => boolean,
): Ride | undefined {
  return sortedRides.find((ride, index) => match(ride, index, sortedRides))
}

// Longest run of consecutive calendar days containing at least one ride.
function replayLongestStreak(sortedRides: Ride[], thresholds: number[]): FamilyResult {
  const sortedThresholds = [...thresholds].sort((a, b) => a - b)
  const earnedAtByThreshold = new Map<number, Date>()
  let longestStreak = 0
  let currentStreak = 0
  let lastDay: Date | null = null
  let nextIdx = 0
  for (const ride of sortedRides) {
    const day = startOfDay(ride.timestamp)
    if (lastDay && day.getTime() === lastDay.getTime()) continue
    currentStreak = lastDay && day.getTime() === addDays(lastDay, 1).getTime() ? currentStreak + 1 : 1
    lastDay = day
    if (currentStreak > longestStreak) longestStreak = currentStreak
    while (nextIdx < sortedThresholds.length && longestStreak >= sortedThresholds[nextIdx]) {
      earnedAtByThreshold.set(sortedThresholds[nextIdx], ride.timestamp)
      nextIdx++
    }
  }
  return { finalValue: longestStreak, earnedAtByThreshold }
}

export function computeAchievements(rides: Ride[], fleet: FleetRecord[]): AchievementsSummary {
  const sortedRides = [...rides].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  const catalog = buildCatalog(fleet)

  const thresholdsByFamily = new Map<string, number[]>()
  for (const def of catalog) {
    if (def.kind !== 'threshold') continue
    const arr = thresholdsByFamily.get(def.familyId) ?? []
    arr.push(def.threshold)
    thresholdsByFamily.set(def.familyId, arr)
  }

  const familyResults = new Map<string, FamilyResult>()

  const totalRidesThresholds = thresholdsByFamily.get('total-rides')
  if (totalRidesThresholds) {
    familyResults.set('total-rides', replayCumulativeCount(sortedRides, totalRidesThresholds))
  }

  const sameCarThresholds = thresholdsByFamily.get('same-car')
  if (sameCarThresholds) {
    const carCounts = new Map<string, number>()
    familyResults.set(
      'same-car',
      replayRunningMax(sortedRides, sameCarThresholds, (ride) => {
        const next = (carCounts.get(ride.carNumber) ?? 0) + 1
        carCounts.set(ride.carNumber, next)
        return next
      }),
    )
  }

  const repeatedDigitThresholds = thresholdsByFamily.get('repeated-digit')
  if (repeatedDigitThresholds) {
    familyResults.set(
      'repeated-digit',
      replayRunningMax(sortedRides, repeatedDigitThresholds, (ride) => digitModeCount(ride.carNumber)),
    )
  }

  const fleetPctThresholds = thresholdsByFamily.get('fleet-pct')
  if (fleetPctThresholds) {
    const activeUnits = new Set<string>()
    for (const record of fleet) {
      if (record.status !== 'Active') continue
      for (const unit of record.unitNumbers) activeUnits.add(unit)
    }
    const activeTotal = activeUnits.size
    let riddenActiveCount = 0
    familyResults.set(
      'fleet-pct',
      replayFirstSeenMilestones(sortedRides, fleetPctThresholds, (ride) => {
        if (!activeUnits.has(ride.carNumber)) return null
        riddenActiveCount += 1
        return activeTotal > 0 ? (riddenActiveCount / activeTotal) * 100 : 0
      }),
    )
  }

  const trainsetThresholds = thresholdsByFamily.get('trainset')
  if (trainsetThresholds) {
    const carToConsist = new Map<string, FleetRecord>()
    for (const record of fleet) {
      for (const unit of record.unitNumbers) carToConsist.set(unit, record)
    }
    const seenPerConsist = new Map<FleetRecord, number>()
    const completedConsists = new Set<FleetRecord>()
    familyResults.set(
      'trainset',
      replayFirstSeenMilestones(sortedRides, trainsetThresholds, (ride) => {
        const consist = carToConsist.get(ride.carNumber)
        if (!consist) return null
        const next = (seenPerConsist.get(consist) ?? 0) + 1
        seenPerConsist.set(consist, next)
        if (next >= consist.unitNumbers.length) completedConsists.add(consist)
        return completedConsists.size
      }),
    )
  }

  const lineThresholds = thresholdsByFamily.get('line')
  if (lineThresholds) {
    const lineUnits = new Map<string, Set<string>>()
    for (const line of LINES) lineUnits.set(line.id, new Set())
    for (const record of fleet) {
      for (const lineId of record.lines) {
        const units = lineUnits.get(lineId)
        if (!units) continue // drop non-canonical tags (6X/7X/V/etc.)
        for (const unit of record.unitNumbers) units.add(unit)
      }
    }
    const carToLines = new Map<string, string[]>()
    for (const [lineId, units] of lineUnits) {
      for (const unit of units) {
        const arr = carToLines.get(unit) ?? []
        arr.push(lineId)
        carToLines.set(unit, arr)
      }
    }
    const lineRemaining = new Map<string, number>()
    for (const [lineId, units] of lineUnits) {
      if (units.size > 0) lineRemaining.set(lineId, units.size)
    }
    const completedLines = new Set<string>()
    familyResults.set(
      'line',
      replayFirstSeenMilestones(sortedRides, lineThresholds, (ride) => {
        const lines = carToLines.get(ride.carNumber)
        if (!lines || lines.length === 0) return null
        let changed = false
        for (const lineId of lines) {
          if (completedLines.has(lineId)) continue
          const remaining = lineRemaining.get(lineId)
          if (remaining === undefined) continue
          const next = remaining - 1
          lineRemaining.set(lineId, next)
          changed = true
          if (next <= 0) completedLines.add(lineId)
        }
        return changed ? completedLines.size : null
      }),
    )
  }

  const carTypeThresholds = thresholdsByFamily.get('car-type')
  if (carTypeThresholds) {
    const carTypeIndex = buildCarTypeIndex(fleet)
    const typesRidden = new Set<string>()
    familyResults.set(
      'car-type',
      replayFirstSeenMilestones(sortedRides, carTypeThresholds, (ride) => {
        const type = carTypeIndex.get(ride.carNumber)
        if (!type) return null
        typesRidden.add(type)
        return typesRidden.size
      }),
    )
  }

  const streakThresholds = thresholdsByFamily.get('streak')
  if (streakThresholds) {
    familyResults.set('streak', replayLongestStreak(sortedRides, streakThresholds))
  }

  const weekendThresholds = thresholdsByFamily.get('weekend-rides')
  if (weekendThresholds) {
    let weekendCount = 0
    familyResults.set(
      'weekend-rides',
      replayRunningMax(sortedRides, weekendThresholds, (ride) => {
        if (isWeekend(ride.timestamp)) weekendCount += 1
        return weekendCount
      }),
    )
  }

  const dailyLinesThresholds = thresholdsByFamily.get('daily-lines')
  if (dailyLinesThresholds) {
    let currentDay = 0
    let linesToday = new Set<string>()
    familyResults.set(
      'daily-lines',
      replayRunningMax(sortedRides, dailyLinesThresholds, (ride) => {
        const day = startOfDay(ride.timestamp).getTime()
        if (day !== currentDay) {
          currentDay = day
          linesToday = new Set()
        }
        linesToday.add(ride.line)
        return linesToday.size
      }),
    )
  }

  const badges: BadgeState[] = catalog.map((def) => {
    if (def.kind === 'threshold') {
      const result = familyResults.get(def.familyId)
      const current = result?.finalValue ?? 0
      const earnedAt = result?.earnedAtByThreshold.get(def.threshold) ?? null
      const status: BadgeStatus = earnedAt ? 'earned' : current > 0 ? 'in-progress' : 'locked'
      return { def, status, progress: { current, target: def.threshold }, earnedAt }
    }
    const match = firstMatchingRide(sortedRides, def.match)
    const earnedAt = match ? match.timestamp : null
    const status: BadgeStatus = earnedAt ? 'earned' : 'locked'
    return { def, status, progress: { current: earnedAt ? 1 : 0, target: 1 }, earnedAt }
  })

  const totalXp = badges
    .filter((b) => b.status === 'earned')
    .reduce((sum, b) => sum + b.def.xp, 0)
  const { level, xpIntoLevel, xpForNextLevel } = levelForXp(totalXp)

  return { badges, totalXp, level, xpIntoLevel, xpForNextLevel }
}

export function selectRecentBadges(summary: AchievementsSummary, now: Date, windowDays = 14): BadgeState[] {
  const cutoff = now.getTime() - windowDays * 24 * 60 * 60 * 1000
  return summary.badges
    .filter((b) => b.status === 'earned' && b.earnedAt && b.earnedAt.getTime() >= cutoff)
    .sort((a, b) => b.earnedAt!.getTime() - a.earnedAt!.getTime())
}

export function selectAlmostThere(summary: AchievementsSummary, limit = 3): BadgeState[] {
  return summary.badges
    .filter((b) => b.status === 'in-progress')
    .sort((a, b) => b.progress.current / b.progress.target - a.progress.current / a.progress.target)
    .slice(0, limit)
}
