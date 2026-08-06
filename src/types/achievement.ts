import type { Ride } from './ride'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type AchievementCategory =
  | 'same-car'
  | 'total-rides'
  | 'fleet-pct'
  | 'trainset'
  | 'line'
  | 'car-type'
  | 'pattern'
  | 'streak'
  | 'weekend'
  | 'explorer'
  | 'time-of-day'
  | 'sequence'

export type BadgeStatus = 'locked' | 'in-progress' | 'earned'

export interface BadgeProgress {
  current: number
  target: number
}

interface BaseBadgeDef {
  id: string
  category: AchievementCategory
  familyId: string
  label: string
  description: string
  rarity: Rarity
  xp: number
}

export interface ThresholdBadgeDef extends BaseBadgeDef {
  kind: 'threshold'
  threshold: number
  format?: (value: number) => string
}

export interface PredicateBadgeDef extends BaseBadgeDef {
  kind: 'predicate'
  /** Sees the full ride and its position in ride history, so predicates can
   *  key off timing (time of day) or sequence (the previous ride), not just
   *  the car number. */
  match: (ride: Ride, index: number, rides: Ride[]) => boolean
  /** Short hint shown while locked (e.g. the exact number to look for). */
  hint?: string
}

export type BadgeDef = ThresholdBadgeDef | PredicateBadgeDef

export interface BadgeState {
  def: BadgeDef
  status: BadgeStatus
  progress: BadgeProgress
  earnedAt: Date | null
}

export interface AchievementsSummary {
  badges: BadgeState[]
  totalXp: number
  level: number
  xpIntoLevel: number
  xpForNextLevel: number
}
