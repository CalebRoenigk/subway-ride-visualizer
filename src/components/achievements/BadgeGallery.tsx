import type { AchievementCategory, BadgeState } from '../../types/achievement'
import { Card } from '../common/Card'
import { BadgeTile } from './BadgeTile'
import './badge-gallery.css'

const CATEGORY_ORDER: AchievementCategory[] = [
  'same-car',
  'total-rides',
  'fleet-pct',
  'trainset',
  'line',
  'car-type',
  'pattern',
]

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  'same-car': 'Same Car',
  'total-rides': 'Total Rides',
  'fleet-pct': 'Fleet Coverage',
  trainset: 'Trainset Completion',
  line: 'Line Completion',
  'car-type': 'Car Type',
  pattern: 'Number Patterns',
}

export function BadgeGallery({ badges, newIds }: { badges: BadgeState[]; newIds?: Set<string> }) {
  const grouped = new Map<AchievementCategory, BadgeState[]>()
  for (const badge of badges) {
    const group = grouped.get(badge.def.category) ?? []
    group.push(badge)
    grouped.set(badge.def.category, group)
  }

  return (
    <div className="badge-gallery">
      {CATEGORY_ORDER.filter((category) => grouped.has(category)).map((category) => {
        const group = grouped.get(category)!
        const earnedCount = group.filter((b) => b.status === 'earned').length
        return (
          <Card key={category} title={CATEGORY_LABELS[category]} meta={`${earnedCount}/${group.length}`}>
            <div className="badge-gallery-grid">
              {group.map((badge) => (
                <BadgeTile key={badge.def.id} badge={badge} isNew={newIds?.has(badge.def.id)} />
              ))}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
