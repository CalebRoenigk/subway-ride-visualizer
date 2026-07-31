import { useMemo } from 'react'
import type { Ride } from '../../types/ride'
import { getContrastText } from '../../data/lines'
import { buildTypeAssignment } from '../../utils/categoryAssignment'
import { useIsDarkMode } from '../../utils/useIsDarkMode'
import '../timeline/timeline-controls.css'
import './type-distribution-bar.css'

export function TypeDistributionBar({ rides }: { rides: Ride[] }) {
  const isDark = useIsDarkMode()
  const assignment = useMemo(() => buildTypeAssignment(rides, isDark), [rides, isDark])

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const ride of rides) {
      const display = assignment.remap(ride.carType || 'Unknown')
      map.set(display, (map.get(display) ?? 0) + 1)
    }
    return map
  }, [rides, assignment])

  const total = rides.length
  const present = assignment.order.filter((id) => (counts.get(id) ?? 0) > 0)

  if (total === 0) {
    return <div className="stacked-chart-empty">No rides yet for this line.</div>
  }

  return (
    <div className="type-distribution">
      <div
        className="type-distribution-bar"
        role="img"
        aria-label="Car type distribution for the selected line"
      >
        {present.map((id) => {
          const count = counts.get(id) ?? 0
          const pct = (count / total) * 100
          const color = assignment.colorOf(id)
          return (
            <div
              key={id}
              className="type-distribution-segment"
              style={{ width: `${pct}%`, background: color, color: getContrastText(color) }}
              title={`${id}: ${count} ${count === 1 ? 'ride' : 'rides'}`}
            >
              {pct > 8 && (
                <div className="type-distribution-label">
                  <span>{id}</span>
                  <span className="tabular">{count}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="color-key-items type-distribution-key">
        {present.map((id) => (
          <div key={id} className="color-key-item">
            <span
              className="color-key-swatch"
              style={{ background: assignment.colorOf(id) }}
            />
            <span>{id}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
