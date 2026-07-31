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

  const segments = useMemo(() => {
    let cumulativePct = 0
    return present.map((id, idx) => {
      const count = counts.get(id) ?? 0
      const pct = total > 0 ? (count / total) * 100 : 0
      const midPct = cumulativePct + pct / 2
      cumulativePct += pct
      const edgeClass = midPct < 10 ? 'is-left-edge' : midPct > 90 ? 'is-right-edge' : ''
      const positionClass = [
        idx === 0 ? 'is-first' : '',
        idx === present.length - 1 ? 'is-last' : '',
        edgeClass,
      ]
        .filter(Boolean)
        .join(' ')
      return { id, count, pct, positionClass }
    })
  }, [present, counts, total])

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
        {segments.map(({ id, count, pct, positionClass }) => {
          const color = assignment.colorOf(id)
          return (
            <div
              key={id}
              className={`type-distribution-segment ${positionClass}`}
              style={{ width: `${pct}%`, background: color, color: getContrastText(color) }}
              tabIndex={0}
            >
              {pct > 8 && (
                <div className="type-distribution-label">
                  <span>{id}</span>
                  <span className="tabular">{count}</span>
                </div>
              )}
              <div className="type-distribution-tooltip">
                <span>{id}</span>
                <span className="type-distribution-tooltip-count">
                  {count} {count === 1 ? 'ride' : 'rides'}
                </span>
              </div>
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
