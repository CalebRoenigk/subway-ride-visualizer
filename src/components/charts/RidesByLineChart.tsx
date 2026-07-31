import { useMemo, useState } from 'react'
import type { Ride } from '../../types/ride'
import { Card } from '../common/Card'
import { LineBullet } from '../common/LineBullet'
import { getLineMeta, LINES } from '../../data/lines'
import { addDays } from '../../utils/date'
import { bucketRidesByDay } from './chart-utils'
import { StackedDayBarChart } from './StackedDayBarChart'
import { DateRangeControl, type RangePreset } from './DateRangeControl'
import './rides-by-line.css'

function rangeStart(preset: RangePreset, end: Date, earliest: Date | null): Date {
  if (preset === 'all') return earliest ?? end
  const days = preset === '7d' ? 6 : preset === '30d' ? 29 : 89
  return addDays(end, -days)
}

const getLine = (ride: Ride) => ride.line || 'Unknown'

export function RidesByLineChart({ rides }: { rides: Ride[] }) {
  const [preset, setPreset] = useState<RangePreset>('30d')
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set())

  function toggleLine(lineId: string) {
    setHiddenLines((prev) => {
      const next = new Set(prev)
      if (next.has(lineId)) next.delete(lineId)
      else next.add(lineId)
      return next
    })
  }

  const earliest = useMemo(
    () =>
      rides.length
        ? new Date(Math.min(...rides.map((r) => r.timestamp.getTime())))
        : null,
    [rides],
  )
  const latest = useMemo(
    () =>
      rides.length
        ? new Date(Math.max(...rides.map((r) => r.timestamp.getTime())))
        : new Date(),
    [rides],
  )

  const start = rangeStart(preset, latest, earliest)
  const buckets = useMemo(
    () => bucketRidesByDay(rides, start, latest, getLine),
    [rides, start, latest],
  )

  const activeLines = useMemo(() => {
    const present = new Set<string>()
    buckets.forEach((b) => b.counts.forEach((_, line) => present.add(line)))
    return LINES.filter((l) => present.has(l.id)).map((l) => l.id)
  }, [buckets])

  const visibleLines = useMemo(
    () => activeLines.filter((id) => !hiddenLines.has(id)),
    [activeLines, hiddenLines],
  )

  const allHidden = activeLines.length > 0 && activeLines.every((id) => hiddenLines.has(id))

  function toggleAll() {
    setHiddenLines(allHidden ? new Set() : new Set(activeLines))
  }

  return (
    <Card
      title="Rides by Line"
      meta={
        <div className="rides-by-line-meta">
          <DateRangeControl value={preset} onChange={setPreset} />
        </div>
      }
    >
      <StackedDayBarChart
        buckets={buckets}
        categories={visibleLines}
        colorOf={(id) => getLineMeta(id).color}
        renderTooltipChip={(id, count) => (
          <>
            <LineBullet line={id} size="sm" />
            <span className="chart-tooltip-value">{count}</span>
          </>
        )}
        ariaLabel={`Stacked bar chart of rides by line, ${buckets.length} days`}
      />

      {activeLines.length > 0 && (
        <div className="rides-by-line-legend">
          <button
            type="button"
            className={`legend-toggle-all ${hiddenLines.size > 0 ? 'is-active' : ''}`}
            onClick={toggleAll}
          >
            {allHidden ? 'Show All' : 'Hide All'}
          </button>
          {activeLines.map((lineId) => {
            const isHidden = hiddenLines.has(lineId)
            return (
              <button
                key={lineId}
                type="button"
                className="legend-item legend-item--toggle"
                aria-pressed={!isHidden}
                title={`${isHidden ? 'Show' : 'Hide'} ${lineId} line`}
                onClick={() => toggleLine(lineId)}
              >
                <LineBullet line={lineId} size="sm" dimmed={isHidden} />
              </button>
            )
          })}
        </div>
      )}
    </Card>
  )
}
