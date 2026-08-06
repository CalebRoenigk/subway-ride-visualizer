export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type AchievementCategory =
  | 'same-car'
  | 'total-rides'
  | 'fleet-pct'
  | 'trainset'
  | 'line'
  | 'car-type'
  | 'pattern'

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
  match: (carNumber: string) => boolean
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
