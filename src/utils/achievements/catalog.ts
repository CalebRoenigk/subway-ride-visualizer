import type { BadgeDef, PredicateBadgeDef, Rarity, ThresholdBadgeDef } from '../../types/achievement'
import type { FleetRecord } from '../../data/loadFleet'
import { buildCarTypeIndex } from '../../data/loadFleet'
import { LINES } from '../../data/lines'
import { FUNNY_NUMBERS } from './funnyNumbers'
import {
  hasRepeatingPairPattern,
  isAscendingRun,
  isDescendingRun,
  isPalindrome,
  isRoundNumber,
} from './predicates'

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
  match: (carNumber: string) => boolean,
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
    threshold('repeated-digit', 'pattern', 4, 'Quadruple Whammy', 'Ride a car with 4 matching digits', 'rare'),
    predicate('pattern-palindrome', 'pattern', 'Mirror Image', 'Ride a car number that reads the same both ways', 'uncommon', isPalindrome),
    predicate('pattern-repeating-pair', 'pattern', 'Echo', "Ride a car number formed from a repeating block (e.g. 4545)", 'rare', hasRepeatingPairPattern),
    predicate('pattern-round-number', 'pattern', 'Round Trip', "Ride a car number ending in '00'", 'common', isRoundNumber),
    predicate('pattern-ascending', 'pattern', 'On a Roll', 'Ride a car number with ascending consecutive digits', 'epic', isAscendingRun),
    predicate('pattern-descending', 'pattern', 'Countdown', 'Ride a car number with descending consecutive digits', 'epic', isDescendingRun),
    ...FUNNY_NUMBERS.map((f) =>
      predicate(f.id, 'pattern', f.label, f.description, 'epic', (carNumber) => carNumber === f.value, f.value),
    ),
  ]

  return badges
}
