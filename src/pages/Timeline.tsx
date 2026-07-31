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
  formatRangeLabel,
  getPresetRange,
  RANGE_PRESET_LABELS,
  type RangePresetId,
} from '../utils/dateRangePresets'
import { Card } from '../components/common/Card'
import { LineBullet } from '../components/common/LineBullet'
import { StatsRow } from '../components/stats/StatsRow'
import { CarNumberHeatmap } from '../components/heatmap/CarNumberHeatmap'
import {
  ColorByControl,
  type ColorByMode,
} from '../components/timeline/ColorByControl'
import { DateRangePickerControl } from '../components/timeline/DateRangePickerControl'
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
  const [preset, setPreset] = useState<RangePresetId>('allTime')
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null)
  const today = useMemo(() => new Date(), [])

  const earliest = useMemo(
    () =>
      rides.length
        ? new Date(Math.min(...rides.map((r) => r.timestamp.getTime())))
        : null,
    [rides],
  )

  const { start, end } = useMemo(() => {
    if (preset === 'custom' && customRange) return customRange
    return getPresetRange(preset, today, earliest) ?? { start: earliest ?? today, end: today }
  }, [preset, customRange, today, earliest])

  function applyRange(newPreset: RangePresetId, newStart: Date, newEnd: Date) {
    setPreset(newPreset)
    if (newPreset === 'custom') setCustomRange({ start: newStart, end: newEnd })
  }

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
        <DateRangePickerControl
          preset={preset}
          start={start}
          end={end}
          earliest={earliest}
          onApply={applyRange}
        />
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

      <CarNumberHeatmap
        rides={periodRides}
        meta={preset === 'custom' ? formatRangeLabel(start, end) : RANGE_PRESET_LABELS[preset]}
        colorOf={(mark) =>
          assignment.colorOf(
            assignment.remap(colorBy === 'line' ? mark.line : mark.carType),
          )
        }
      />

      <StatsRow stats={stats} />
    </div>
  )
}
