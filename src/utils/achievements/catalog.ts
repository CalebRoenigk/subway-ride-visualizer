import type { BadgeDef, PredicateBadgeDef, Rarity, ThresholdBadgeDef } from '../../types/achievement'
import type { FleetRecord } from '../../data/loadFleet'
import { buildCarTypeIndex } from '../../data/loadFleet'
import { LINES } from '../../data/lines'
import type { Ride } from '../../types/ride'
import { FUNNY_NUMBERS } from './funnyNumbers'
import {
  hasRepeatingPairPattern,
  isAscendingRun,
  isDescendingRun,
  isPalindrome,
  isRoundNumber,
} from './predicates'
import { isBackToBack, isEarlyBird, isHighNoon, isNightOwl, isUTurn, makeRapidTriple } from './timePredicates'

const RARITY_XP: Record<Rarity, number> = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 100,
  legendary: 250,
}

function threshold(
  familyId: string,
  category: ThresholdBadgeDef['category'],
  threshold: number,
  label: string,
  description: string,
  rarity: Rarity,
): ThresholdBadgeDef {
  return {
    kind: 'threshold',
    id: `${familyId}-${threshold}`,
    familyId,
    category,
    threshold,
    label,
    description,
    rarity,
    xp: RARITY_XP[rarity],
  }
}

function predicate(
  id: string,
  category: PredicateBadgeDef['category'],
  label: string,
  description: string,
  rarity: Rarity,
  matchCarNumber: (carNumber: string) => boolean,
  hint?: string,
): PredicateBadgeDef {
  return {
    kind: 'predicate',
    id,
    familyId: id,
    category,
    label,
    description,
    rarity,
    xp: RARITY_XP[rarity],
    match: (ride) => matchCarNumber(ride.carNumber),
    hint,
  }
}

// Like predicate(), but the matcher sees the full ride (and its neighbors
// in history) instead of just a car number — for timing/sequence badges.
function ridePredicate(
  id: string,
  category: PredicateBadgeDef['category'],
  label: string,
  description: string,
  rarity: Rarity,
  match: (ride: Ride, index: number, rides: Ride[]) => boolean,
  hint?: string,
): PredicateBadgeDef {
  return {
    kind: 'predicate',
    id,
    familyId: id,
    category,
    label,
    description,
    rarity,
    xp: RARITY_XP[rarity],
    match,
    hint,
  }
}

// Fleet is only needed to resolve the live count of distinct car types
// (currently 15) — every other tier count is either user-specified or
// derived from the static LINES list.
export function buildCatalog(fleet: FleetRecord[]): BadgeDef[] {
  const typeCount = new Set(buildCarTypeIndex(fleet).values()).size

  const badges: BadgeDef[] = [
    // Same car, ridden repeatedly
    threshold('same-car', 'same-car', 2, 'Familiar Face', 'Ride the same car twice', 'common'),
    threshold('same-car', 'same-car', 5, 'Regular', 'Ride the same car 5 times', 'uncommon'),
    threshold('same-car', 'same-car', 10, 'Frequent Flyer', 'Ride the same car 10 times', 'rare'),
    threshold('same-car', 'same-car', 25, 'Creature of Habit', 'Ride the same car 25 times', 'epic'),
    threshold('same-car', 'same-car', 50, 'Devoted', 'Ride the same car 50 times', 'legendary'),
    threshold('same-car', 'same-car', 100, 'Soulmate', 'Ride the same car 100 times', 'legendary'),

    // Total rides logged
    threshold('total-rides', 'total-rides', 10, 'First Fare', 'Log 10 total rides', 'common'),
    threshold('total-rides', 'total-rides', 100, 'Straphanger', 'Log 100 total rides', 'uncommon'),
    threshold('total-rides', 'total-rides', 500, 'Metro Regular', 'Log 500 total rides', 'rare'),
    threshold('total-rides', 'total-rides', 1000, 'Four Digits', 'Log 1,000 total rides', 'epic'),
    threshold('total-rides', 'total-rides', 2500, 'Rail Veteran', 'Log 2,500 total rides', 'epic'),
    threshold('total-rides', 'total-rides', 5000, 'System Native', 'Log 5,000 total rides', 'legendary'),
    threshold('total-rides', 'total-rides', 10000, 'Lived Here', 'Log 10,000 total rides', 'legendary'),

    // Share of the active fleet ridden
    threshold('fleet-pct', 'fleet-pct', 5, 'Fleet Scout', 'Ride 5% of the active fleet', 'common'),
    threshold('fleet-pct', 'fleet-pct', 10, 'Fleet Tracker', 'Ride 10% of the active fleet', 'uncommon'),
    threshold('fleet-pct', 'fleet-pct', 25, 'Fleet Analyst', 'Ride 25% of the active fleet', 'rare'),
    threshold('fleet-pct', 'fleet-pct', 50, 'Fleet Historian', 'Ride 50% of the active fleet', 'epic'),
    threshold('fleet-pct', 'fleet-pct', 100, 'Full Roster', 'Ride 100% of the active fleet', 'legendary'),

    // Trainsets (consists) fully ridden
    threshold('trainset', 'trainset', 1, 'First Consist', 'Fully ride 1 trainset', 'common'),
    threshold('trainset', 'trainset', 5, 'Set Collector', 'Fully ride 5 trainsets', 'uncommon'),
    threshold('trainset', 'trainset', 10, 'Yard Regular', 'Fully ride 10 trainsets', 'rare'),
    threshold('trainset', 'trainset', 25, 'Consist Completionist', 'Fully ride 25 trainsets', 'epic'),
    threshold('trainset', 'trainset', 50, 'Roster Master', 'Fully ride 50 trainsets', 'legendary'),

    // Lines fully ridden (every car ever assigned to that line)
    threshold('line', 'line', 1, 'Home Line', 'Fully ride every car on 1 line', 'common'),
    threshold('line', 'line', 3, 'Triple Track', 'Fully ride every car on 3 lines', 'uncommon'),
    threshold('line', 'line', 5, 'Five Alive', 'Fully ride every car on 5 lines', 'rare'),
    threshold('line', 'line', 10, 'Half the Map', 'Fully ride every car on 10 lines', 'epic'),
    threshold('line', 'line', LINES.length, 'Every Last Line', `Fully ride every car on all ${LINES.length} lines`, 'legendary'),

    // Distinct car types ridden
    threshold('car-type', 'car-type', 5, 'Rolling Stock Rookie', 'Ride 5 distinct car types', 'common'),
    threshold('car-type', 'car-type', 10, 'Type Specialist', 'Ride 10 distinct car types', 'rare'),
    threshold('car-type', 'car-type', typeCount, 'Type Specimen', `Ride all ${typeCount} distinct car types`, 'legendary'),

    // Number patterns
    threshold('repeated-digit', 'pattern', 2, 'Double Take', 'Ride a car with 2 matching digits', 'common'),
    threshold('repeated-digit', 'pattern', 3, 'Triple Threat', 'Ride a car with 3 matching digits', 'uncommon'),
    threshold('repeated-digit', 'pattern', 4, 'Quadruple Whammy', 'Ride a car with all 4 digits the same (e.g. 4444)', 'rare'),
    predicate('pattern-palindrome', 'pattern', 'Mirror Image', 'Ride a car number that reads the same both ways', 'uncommon', isPalindrome),
    predicate('pattern-repeating-pair', 'pattern', 'Echo', "Ride a car number formed from a repeating block (e.g. 4545)", 'rare', hasRepeatingPairPattern),
    predicate('pattern-round-number', 'pattern', 'Round Trip', "Ride a car number ending in '00'", 'common', isRoundNumber),
    predicate('pattern-ascending', 'pattern', 'On a Roll', 'Ride a car number with ascending consecutive digits', 'epic', isAscendingRun),
    predicate('pattern-descending', 'pattern', 'Countdown', 'Ride a car number with descending consecutive digits', 'epic', isDescendingRun),
    ...FUNNY_NUMBERS.map((f) =>
      predicate(f.id, 'pattern', f.label, f.description, 'epic', (carNumber) => carNumber === f.value, f.value),
    ),

    // Consecutive-day riding streaks
    threshold('streak', 'streak', 3, 'On a Streak', 'Ride on 3 consecutive days', 'common'),
    threshold('streak', 'streak', 7, 'Week Strong', 'Ride on 7 consecutive days', 'uncommon'),
    threshold('streak', 'streak', 14, 'Two-Week Tear', 'Ride on 14 consecutive days', 'rare'),
    threshold('streak', 'streak', 30, 'Monthlong Marathon', 'Ride on 30 consecutive days', 'legendary'),

    // Rides logged specifically on Saturdays/Sundays
    threshold('weekend-rides', 'weekend', 5, 'Weekend Warrior', 'Log 5 rides on a weekend', 'common'),
    threshold('weekend-rides', 'weekend', 25, 'Weekend Regular', 'Log 25 rides on a weekend', 'uncommon'),
    threshold('weekend-rides', 'weekend', 100, 'Weekend Devotee', 'Log 100 rides on a weekend', 'rare'),
    threshold('weekend-rides', 'weekend', 250, 'No Weekdays Needed', 'Log 250 rides on a weekend', 'epic'),

    // Distinct lines ridden within a single calendar day
    threshold('daily-lines', 'explorer', 3, 'Day Tripper', 'Ride 3 different lines in a single day', 'common'),
    threshold('daily-lines', 'explorer', 5, 'Line Hopper', 'Ride 5 different lines in a single day', 'uncommon'),
    threshold('daily-lines', 'explorer', 8, 'Grand Tour', 'Ride 8 different lines in a single day', 'rare'),
    threshold('daily-lines', 'explorer', 12, 'System Sweep', 'Ride 12 different lines in a single day', 'epic'),

    // Time-of-day one-offs
    ridePredicate('time-early-bird', 'time-of-day', 'Early Bird', 'Ride a car before 6am', 'common', isEarlyBird),
    ridePredicate('time-night-owl', 'time-of-day', 'Night Owl', 'Ride a car between midnight and 4am', 'uncommon', isNightOwl),
    ridePredicate('time-high-noon', 'time-of-day', 'High Noon', 'Ride a car logged at exactly 12:00pm', 'epic', isHighNoon),

    // Sequence: back-to-back rides on consecutively-numbered cars
    ridePredicate(
      'sequence-back-to-back',
      'sequence',
      'Back to Back',
      'Ride two consecutively-numbered cars back-to-back',
      'epic',
      isBackToBack,
    ),

    // Sequence: 3 rides logged within a shrinking time window
    ridePredicate(
      'rapid-rides-60',
      'sequence',
      'Quick Succession',
      'Log 3 rides within 1 hour of each other',
      'rare',
      makeRapidTriple(60),
    ),
    ridePredicate(
      'rapid-rides-30',
      'sequence',
      'Rapid Succession',
      'Log 3 rides within 30 minutes of each other',
      'epic',
      makeRapidTriple(30),
    ),
    ridePredicate(
      'rapid-rides-15',
      'sequence',
      'Lightning Round',
      'Log 3 rides within 15 minutes of each other',
      'legendary',
      makeRapidTriple(15),
    ),

    // Sequence: same line, back-to-back, inside 15 minutes
    ridePredicate(
      'sequence-u-turn',
      'sequence',
      'U-Turn',
      'Ride the same line twice within 15 minutes',
      'rare',
      isUTurn,
    ),
  ]

  return badges
}
