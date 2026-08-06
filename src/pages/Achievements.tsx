import { useEffect, useMemo, useRef } from 'react'
import confetti from 'canvas-confetti'
import { useRides } from '../data/useRides'
import { useFleet } from '../data/useFleet'
import { computeAchievements, selectAlmostThere, selectRecentBadges } from '../utils/achievements/engine'
import { useAchievementsVisit } from '../utils/useAchievementsVisit'
import { AchievementsHeader } from '../components/achievements/AchievementsHeader'
import { RecentBadgesFeed } from '../components/achievements/RecentBadgesFeed'
import { AlmostThereFeed } from '../components/achievements/AlmostThereFeed'
import { BadgeGallery } from '../components/achievements/BadgeGallery'
import './achievements.css'

export function Achievements() {
  const { rides, loading: ridesLoading } = useRides()
  const { fleet, loading: fleetLoading } = useFleet()
  const lastVisitedAt = useAchievementsVisit()
  const confettiFired = useRef(false)

  const summary = useMemo(() => computeAchievements(rides, fleet), [rides, fleet])
  const recentBadges = useMemo(() => selectRecentBadges(summary, new Date()), [summary])
  const almostThere = useMemo(() => selectAlmostThere(summary), [summary])

  const newIds = useMemo(() => {
    const ids = new Set<string>()
    if (!lastVisitedAt) return ids
    for (const badge of summary.badges) {
      if (badge.status === 'earned' && badge.earnedAt && badge.earnedAt.getTime() > lastVisitedAt.getTime()) {
        ids.add(badge.def.id)
      }
    }
    return ids
  }, [summary, lastVisitedAt])

  useEffect(() => {
    if (confettiFired.current || newIds.size === 0) return
    confettiFired.current = true
    confetti({
      particleCount: Math.min(80 + newIds.size * 20, 300),
      spread: 90,
      origin: { y: 0.25 },
      colors: ['#f2b418', '#ffcc3d', '#ffffff'],
    })
  }, [newIds])

  if (ridesLoading || fleetLoading) {
    return <div className="page-loading">Loading rides…</div>
  }

  const earnedCount = summary.badges.filter((b) => b.status === 'earned').length

  return (
    <div className="page-stack achievements-page">
      <AchievementsHeader
        level={summary.level}
        xpIntoLevel={summary.xpIntoLevel}
        xpForNextLevel={summary.xpForNextLevel}
        totalXp={summary.totalXp}
        earnedCount={earnedCount}
        totalCount={summary.badges.length}
      />
      <RecentBadgesFeed badges={recentBadges} />
      <AlmostThereFeed badges={almostThere} />
      <BadgeGallery badges={summary.badges} newIds={newIds} />
    </div>
  )
}
