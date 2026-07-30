import { useMemo, useState } from 'react'
import type { Ride } from '../types/ride'
import { useRides } from '../data/useRides'
import { useIsDarkMode } from '../utils/useIsDarkMode'
import { computeOverviewStats } from '../utils/stats'
import { bucketRidesByDay } from '../components/charts/chart-utils'
import { StackedDayBarChart } from '../components/charts/StackedDayBarChart'
import {
  buildLineAssignment,
  buildTypeAssignment,
} from '../utils/categoryAssignment'
import {
  getTimePeriodRange,
  TIME_PERIOD_LABELS,
  type TimePeriod,
} from '../utils/timePeriod'
import { Card } from '../components/common/Card'
import { LineBullet } from '../components/common/LineBullet'
import { StatsRow } from '../components/stats/StatsRow'
import { CarNumberHeatmap } from '../components/heatmap/CarNumberHeatmap'
import {
  ColorByControl,
  type ColorByMode,
} from '../components/timeline/ColorByControl'
import { TimePeriodControl } from '../components/timeline/TimePeriodControl'
import { ColorKey } from '../components/timeline/ColorKey'
import '../components/timeline/timeline-controls.css'
import './timeline.css'

function rawCategory(ride: Ride, colorBy: ColorByMode): string {
  return colorBy === 'line' ? ride.line || 'Unknown' : ride.carType || 'Unknown'
}

export function Timeline() {
  const { rides, loading } = useRides()
  const isDark = useIsDarkMode()
  const [colorBy, setColorBy] = useState<ColorByMode>('type')
  const [period, setPeriod] = useState<TimePeriod>('month')

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

  const { start, end } = useMemo(
    () => getTimePeriodRange(period, latest, earliest),
    [period, latest, earliest],
  )

  const periodRides = useMemo(
    () =>
      rides.filter(
        (r) => r.timestamp >= start && r.timestamp <= end,
      ),
    [rides, start, end],
  )

  const assignment = useMemo(
    () =>
      colorBy === 'line'
        ? buildLineAssignment(periodRides)
        : buildTypeAssignment(periodRides, isDark),
    [colorBy, periodRides, isDark],
  )

  const buckets = useMemo(
    () =>
      bucketRidesByDay(periodRides, start, end, (r) =>
        assignment.remap(rawCategory(r, colorBy)),
      ),
    [periodRides, start, end, assignment, colorBy],
  )

  const stats = useMemo(() => computeOverviewStats(periodRides), [periodRides])

  if (loading) {
    return <div className="page-loading">Loading rides…</div>
  }

  return (
    <div className="page-stack">
      <div className="timeline-controls">
        <ColorByControl value={colorBy} onChange={setColorBy} />
        <TimePeriodControl value={period} onChange={setPeriod} />
      </div>

      <ColorKey mode={colorBy} order={assignment.order} colorOf={assignment.colorOf} />

      <Card title="Rides">
        <StackedDayBarChart
          buckets={buckets}
          categories={assignment.order}
          colorOf={assignment.colorOf}
          ariaLabel={`Stacked bar chart of rides by ${colorBy}, ${buckets.length} days`}
          emptyMessage="No rides in this period."
          renderTooltipChip={(id, count) =>
            colorBy === 'line' ? (
              <>
                <LineBullet line={id} size="sm" />
                <span className="chart-tooltip-value">{count}</span>
              </>
            ) : (
              <>
                <span
                  className="chart-tooltip-swatch"
                  style={{ background: assignment.colorOf(id) }}
                />
                <span>{id}</span>
                <span className="chart-tooltip-value">{count}</span>
              </>
            )
          }
        />
      </Card>

      <CarNumberHeatmap rides={periodRides} meta={TIME_PERIOD_LABELS[period]} />

      <StatsRow stats={stats} />
    </div>
  )
}
