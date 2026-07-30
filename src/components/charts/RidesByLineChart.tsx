import { useMemo, useRef, useState } from 'react'
import type { Ride } from '../../types/ride'
import { Card } from '../common/Card'
import { LineBullet } from '../common/LineBullet'
import { getLineMeta, LINES } from '../../data/lines'
import { addDays } from '../../utils/date'
import {
  bucketRidesByDay,
  computeDateTickInterval,
  computeYTicks,
  type DayBucket,
} from './chart-utils'
import { DateRangeControl, type RangePreset } from './DateRangeControl'
import { useElementWidth } from './useElementWidth'
import './rides-by-line.css'

const MARGIN = { top: 8, right: 8, bottom: 30, left: 34 }
const PLOT_HEIGHT = 200
const BAR_MAX_WIDTH = 24
const SEGMENT_GAP = 2

function rangeStart(preset: RangePreset, end: Date, earliest: Date | null): Date {
  if (preset === 'all') return earliest ?? end
  const days = preset === '7d' ? 6 : preset === '30d' ? 29 : 89
  return addDays(end, -days)
}

function roundedTopPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, Math.max(height, 0))
  if (height <= 0) return ''
  if (r <= 0) {
    return `M${x},${y} h${width} v${height} h${-width} Z`
  }
  return `M${x},${y + r}
    a${r},${r} 0 0 1 ${r},${-r}
    h${width - 2 * r}
    a${r},${r} 0 0 1 ${r},${r}
    v${height - r}
    h${-width}
    Z`
}

interface HoverInfo {
  index: number
  x: number
  y: number
}

export function RidesByLineChart({ rides }: { rides: Ride[] }) {
  const [preset, setPreset] = useState<RangePreset>('30d')
  const [hover, setHover] = useState<HoverInfo | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const width = useElementWidth(containerRef, 640)

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
    () => bucketRidesByDay(rides, start, latest),
    [rides, start, latest],
  )

  const activeLines = useMemo(() => {
    const present = new Set<string>()
    buckets.forEach((b) => b.counts.forEach((_, line) => present.add(line)))
    return LINES.filter((l) => present.has(l.id)).map((l) => l.id)
  }, [buckets])

  const maxTotal = Math.max(0, ...buckets.map((b) => b.total))
  const { ticks, niceMax } = computeYTicks(maxTotal)

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0)
  const dayWidth = buckets.length ? plotWidth / buckets.length : 0
  const barWidth = Math.max(Math.min(BAR_MAX_WIDTH, dayWidth * 0.6), 2)
  const tickInterval = computeDateTickInterval(buckets.length)

  const yScale = (v: number) =>
    niceMax > 0 ? PLOT_HEIGHT - (v / niceMax) * PLOT_HEIGHT : PLOT_HEIGHT

  const svgHeight = MARGIN.top + PLOT_HEIGHT + MARGIN.bottom

  const hoveredBucket = hover ? buckets[hover.index] : null

  function updateHoverFromPointer(index: number, e: { clientX: number; clientY: number }) {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setHover({ index, x: e.clientX - rect.left, y: e.clientY - rect.top })
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
      {buckets.every((b) => b.total === 0) ? (
        <div className="rides-by-line-empty">No rides in this range.</div>
      ) : (
        <div className="rides-by-line-chart" ref={containerRef}>
          <svg
            width="100%"
            height={svgHeight}
            role="img"
            aria-label={`Stacked bar chart of rides by line, ${buckets.length} days`}
            onMouseLeave={() => setHover(null)}
          >
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {ticks.map((t) => (
                <g key={t}>
                  <line
                    x1={0}
                    x2={plotWidth}
                    y1={yScale(t)}
                    y2={yScale(t)}
                    className="gridline"
                  />
                  <text x={-8} y={yScale(t)} className="axis-label y-axis-label">
                    {t.toLocaleString()}
                  </text>
                </g>
              ))}
              <line
                x1={0}
                x2={plotWidth}
                y1={PLOT_HEIGHT}
                y2={PLOT_HEIGHT}
                className="baseline"
              />

              {buckets.map((bucket, i) => {
                const slotX = i * dayWidth
                const barX = slotX + (dayWidth - barWidth) / 2
                let cumulative = 0
                const segments = activeLines
                  .map((lineId) => bucket.counts.get(lineId) ?? 0)
                  .map((value, idx) => {
                    const lineId = activeLines[idx]
                    const y0 = cumulative
                    cumulative += value
                    return { lineId, value, y0, y1: cumulative }
                  })
                  .filter((s) => s.value > 0)

                const isHovered = hover?.index === i
                const hasData = bucket.total > 0

                return (
                  <g key={bucket.date.toISOString()}>
                    {isHovered && (
                      <rect
                        x={slotX}
                        y={0}
                        width={dayWidth}
                        height={PLOT_HEIGHT}
                        className="hover-band"
                      />
                    )}
                    {segments.map((seg, si) => {
                      const isTop = si === segments.length - 1
                      const top = yScale(seg.y1)
                      const bottom = yScale(seg.y0)
                      const rawHeight = bottom - top
                      const height = Math.max(rawHeight - SEGMENT_GAP, 0)
                      const y = top + SEGMENT_GAP / 2
                      const meta = getLineMeta(seg.lineId)
                      return isTop ? (
                        <path
                          key={seg.lineId}
                          d={roundedTopPath(barX, y, barWidth, height, 4)}
                          fill={meta.color}
                        />
                      ) : (
                        <rect
                          key={seg.lineId}
                          x={barX}
                          y={y}
                          width={barWidth}
                          height={height}
                          fill={meta.color}
                        />
                      )
                    })}
                    <rect
                      x={slotX}
                      y={0}
                      width={dayWidth}
                      height={PLOT_HEIGHT}
                      fill="transparent"
                      tabIndex={hasData ? 0 : undefined}
                      role={hasData ? 'img' : undefined}
                      aria-label={
                        hasData
                          ? `${bucket.date.toDateString()}: ${bucket.total} rides`
                          : undefined
                      }
                      onMouseEnter={
                        hasData
                          ? (e) => updateHoverFromPointer(i, e)
                          : () => setHover(null)
                      }
                      onMouseMove={
                        hasData
                          ? (e) => updateHoverFromPointer(i, e)
                          : undefined
                      }
                      onFocus={
                        hasData
                          ? () =>
                              setHover({
                                index: i,
                                x: slotX + dayWidth / 2,
                                y: yScale(bucket.total),
                              })
                          : undefined
                      }
                    />
                  </g>
                )
              })}

              {buckets.map((bucket, i) => {
                if (i % tickInterval !== 0 && i !== buckets.length - 1) return null
                const prevBucket = buckets[i - tickInterval]
                const showMonth =
                  i === 0 ||
                  !prevBucket ||
                  prevBucket.date.getMonth() !== bucket.date.getMonth()
                const x = i * dayWidth + dayWidth / 2
                return (
                  <g key={`tick-${bucket.date.toISOString()}`}>
                    <text x={x} y={PLOT_HEIGHT + 14} className="axis-label x-axis-label">
                      {bucket.date.getDate()}
                    </text>
                    {showMonth && (
                      <text
                        x={x}
                        y={PLOT_HEIGHT + 26}
                        className="axis-label x-axis-month"
                      >
                        {bucket.date.toLocaleDateString('en-US', { month: 'short' })}
                      </text>
                    )}
                  </g>
                )
              })}
            </g>
          </svg>

          {hoveredBucket && hover && (
            <ChartTooltip
              bucket={hoveredBucket}
              lines={activeLines}
              x={hover.x}
              y={hover.y}
              containerWidth={width}
            />
          )}
        </div>
      )}

      {activeLines.length > 0 && (
        <div className="rides-by-line-legend">
          {activeLines.map((lineId) => (
            <div key={lineId} className="legend-item">
              <LineBullet line={lineId} size="sm" />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function ChartTooltip({
  bucket,
  lines,
  x,
  y,
  containerWidth,
}: {
  bucket: DayBucket
  lines: string[]
  x: number
  y: number
  containerWidth: number
}) {
  const rows = lines
    .map((lineId) => ({ lineId, count: bucket.counts.get(lineId) ?? 0 }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)

  const pct = containerWidth > 0 ? x / containerWidth : 0.5
  const hAnchor = pct < 0.15 ? 'is-left-edge' : pct > 0.85 ? 'is-right-edge' : ''
  const vAnchor = y < 110 ? 'is-top-edge' : ''

  return (
    <div
      className={`chart-tooltip ${hAnchor} ${vAnchor}`}
      style={{ left: x, top: y }}
      role="tooltip"
    >
      <div className="chart-tooltip-date">
        {bucket.date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })}
      </div>
      <div className="chart-tooltip-chips">
        {rows.map((row) => (
          <div key={row.lineId} className="chart-tooltip-chip">
            <LineBullet line={row.lineId} size="sm" />
            <span className="chart-tooltip-value">{row.count}</span>
          </div>
        ))}
      </div>
      <div className="chart-tooltip-total">
        <span>Total</span>
        <span className="chart-tooltip-value">{bucket.total}</span>
      </div>
    </div>
  )
}
