import './achievements-header.css'

interface AchievementsHeaderProps {
  level: number
  xpIntoLevel: number
  xpForNextLevel: number
  totalXp: number
  earnedCount: number
  totalCount: number
}

export function AchievementsHeader({
  level,
  xpIntoLevel,
  xpForNextLevel,
  totalXp,
  earnedCount,
  totalCount,
}: AchievementsHeaderProps) {
  const pct = xpForNextLevel > 0 ? Math.min((xpIntoLevel / xpForNextLevel) * 100, 100) : 100

  return (
    <div className="achievements-header">
      <div className="achievements-header-left">
        <div className="achievements-eyebrow">Achievement Level</div>
        <div className="achievements-level">{String(level).padStart(2, '0')}</div>
        <div className="achievements-xp-bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="achievements-xp-caption">
          {xpIntoLevel} / {xpForNextLevel} XP to Level {level + 1}
        </div>
      </div>
      <div className="achievements-header-right">
        <div className="achievements-badge-count">
          {earnedCount}/{totalCount}
        </div>
        <div className="achievements-badge-count-label">Badges Earned</div>
        <div className="achievements-xp-total">{totalXp.toLocaleString()} XP total</div>
      </div>
    </div>
  )
}
