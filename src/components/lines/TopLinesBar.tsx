import { useMemo } from 'react'
import type { Ride } from '../../types/ride'
import { Card } from '../common/Card'
import { LineBullet } from '../common/LineBullet'
import { getLineMeta } from '../../data/lines'
import './top-lines-bar.css'

export function TopLinesBar({ rides, limit = 10 }: { rides: Ride[]; limit?: number }) {
  const ranked = useMemo(() => {
    const counts = new Map<string, number>()
    for (const ride of rides) {
      const line = ride.line || 'Unknown'
      counts.set(line, (counts.get(line) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([line, count]) => ({ line, count }))
  }, [rides, limit])

  const maxCount = ranked[0]?.count ?? 1

  return (
    <Card title={`Top ${limit} Lines by Volume`}>
      {ranked.length === 0 ? (
        <div className="stacked-chart-empty">No rides yet.</div>
      ) : (
        <div className="top-lines-list">
          {ranked.map(({ line, count }) => (
            <div className="top-lines-row" key={line}>
              <LineBullet line={line} size="sm" />
              <div className="top-lines-track">
                <div
                  className="top-lines-fill"
                  style={{
                    width: `${(count / maxCount) * 100}%`,
                    background: getLineMeta(line).color,
                  }}
                />
              </div>
              <span className="top-lines-count tabular">{count}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
