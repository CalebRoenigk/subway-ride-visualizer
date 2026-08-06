import type { BadgeState } from '../../types/achievement'
import { formatRideDate } from '../../utils/date'
import { Card } from '../common/Card'
import { BadgeShape } from './BadgeShape'
import { getBadgeIcon } from './badgeIcons'
import './recent-badges-feed.css'

export function RecentBadgesFeed({ badges }: { badges: BadgeState[] }) {
  return (
    <Card title="Recent Badges" meta="Last 14 days">
      {badges.length === 0 ? (
        <div className="recent-badges-empty">Nothing earned in the last 14 days — yet.</div>
      ) : (
        <div className="recent-badges-row">
          {badges.map((badge) => (
            <div className="recent-badge-item" key={badge.def.id}>
              <BadgeShape
                status="earned"
                rarity={badge.def.rarity}
                size={52}
                icon={getBadgeIcon(badge.def.familyId)}
              />
              <div className="recent-badge-when">
                {badge.def.label}
                <br />
                {badge.earnedAt ? formatRideDate(badge.earnedAt) : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
