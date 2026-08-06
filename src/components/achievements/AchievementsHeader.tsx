import './achievements-header.css'

interface AchievementsHeaderProps {
  level: number
  xpIntoLevel: number
  xpForNextLevel: number
  totalXp: number
  earnedCount: number
  totalCount: number
}

const TICK_COUNT = 24

export function AchievementsHeader({
  level,
  xpIntoLevel,
  xpForNextLevel,
  totalXp,
  earnedCount,
  totalCount,
}: AchievementsHeaderProps) {
  const litTicks =
    xpForNextLevel > 0 ? Math.round((xpIntoLevel / xpForNextLevel) * TICK_COUNT) : TICK_COUNT

  return (
    <div className="achievements-header">
      <div className="achievements-header-left">
        <div className="achievements-eyebrow">Achievement Level</div>
        <div className="achievements-level">{String(level).padStart(2, '0')}</div>
        <div className="achievements-ticks">
          {Array.from({ length: TICK_COUNT }, (_, i) => (
            <div key={i} className={i < litTicks ? 'achievements-tick is-lit' : 'achievements-tick'} />
          ))}
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
