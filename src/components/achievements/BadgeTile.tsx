import type { CSSProperties } from 'react'
import type { BadgeState } from '../../types/achievement'
import { formatBadgeFraction } from '../../utils/achievements/format'
import { BadgeShape } from './BadgeShape'
import './badge-tile.css'

export function BadgeTile({ badge, isNew, index = 0 }: { badge: BadgeState; isNew?: boolean; index?: number }) {
  const pct = (badge.progress.current / badge.progress.target) * 100
  return (
    <div
      className={isNew ? 'badge-tile badge-tile--new' : 'badge-tile'}
      data-status={badge.status}
      title={badge.def.description}
      style={{ '--i': index } as CSSProperties}
    >
      <BadgeShape status={badge.status} rarity={badge.def.rarity} fillPct={pct} />
      <div className="badge-tile-label">{badge.def.label}</div>
      <div className="badge-tile-frac">{formatBadgeFraction(badge)}</div>
    </div>
  )
}
