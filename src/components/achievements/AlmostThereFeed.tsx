import type { BadgeState } from '../../types/achievement'
import { formatBadgeFraction } from '../../utils/achievements/format'
import { Card } from '../common/Card'
import { BadgeShape } from './BadgeShape'
import './almost-there-feed.css'

export function AlmostThereFeed({ badges }: { badges: BadgeState[] }) {
  return (
    <Card title="Almost There">
      {badges.length === 0 ? (
        <div className="almost-there-empty">Nothing in progress right now.</div>
      ) : (
        badges.map((badge) => {
          const pct = (badge.progress.current / badge.progress.target) * 100
          return (
            <div className="almost-there-row" key={badge.def.id}>
              <div className="almost-there-icon">
                <BadgeShape status="in-progress" rarity={badge.def.rarity} fillPct={pct} />
              </div>
              <div className="almost-there-body">
                <div className="almost-there-label">{badge.def.label}</div>
                <div className="almost-there-meta">{badge.def.description}</div>
                <div className="almost-there-bar">
                  <i style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
              <div className="almost-there-frac">{formatBadgeFraction(badge)}</div>
            </div>
          )
        })
      )}
    </Card>
  )
}
