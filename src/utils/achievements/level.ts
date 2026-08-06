// level = floor(sqrt(xp / K)) + 1, so xpToReachLevel(L) = K * (L - 1)^2.
// Chosen so a full 46-badge sweep (4,155 XP) lands around level 17 —
// a satisfying ceiling without ever feeling "solved" — and needs no
// tuning if more badge tiers are added later.
const LEVEL_K = 15

export function xpToReachLevel(level: number): number {
  return LEVEL_K * (level - 1) ** 2
}

export interface LevelInfo {
  level: number
  xpIntoLevel: number
  xpForNextLevel: number
}

export function levelForXp(xp: number): LevelInfo {
  const level = Math.floor(Math.sqrt(xp / LEVEL_K)) + 1
  const currentFloor = xpToReachLevel(level)
  const nextFloor = xpToReachLevel(level + 1)
  return {
    level,
    xpIntoLevel: xp - currentFloor,
    xpForNextLevel: nextFloor - currentFloor,
  }
}
