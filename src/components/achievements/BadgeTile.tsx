import type { BadgeState } from '../../types/achievement'
import { formatBadgeFraction } from '../../utils/achievements/format'
import { Hexagon } from './Hexagon'
import './badge-tile.css'

export function BadgeTile({ badge, isNew }: { badge: BadgeState; isNew?: boolean }) {
  const pct = (badge.progress.current / badge.progress.target) * 100
  return (
    <div
      className={isNew ? 'badge-tile badge-tile--new' : 'badge-tile'}
      data-status={badge.status}
      title={badge.def.description}
    >
      <Hexagon status={badge.status} fillPct={pct} />
      <div className="badge-tile-label">{badge.def.label}</div>
      <div className="badge-tile-frac">{formatBadgeFraction(badge)}</div>
    </div>
  )
}
