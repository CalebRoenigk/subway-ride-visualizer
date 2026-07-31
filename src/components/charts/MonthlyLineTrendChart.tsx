import { useMemo, useRef, useState, type ReactNode } from 'react'
import {
  computeDateTickInterval,
  computeYTicks,
  type MonthBucket,
} from './chart-utils'
import { useElementWidth } from './useElementWidth'
import './stacked-day-bar-chart.css'
import './monthly-line-trend-chart.css'

const MARGIN = { top: 8, right: 16, bottom: 30, left: 34 }
const PLOT_HEIGHT = 200

interface HoverInfo {
  index: number
  x: number
  y: number
}

interface Point {
  x: number
  y: number
  value: number
}

// Catmull-Rom -> cubic Bezier conversion for a smooth (not sharply angular)
// line, matching the wireframe's curved trend lines.
function smoothPath(points: Point[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M${points[0].x},${points[0].y}`

  let d = `M${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }
  return d
}

interface MonthlyLineTrendChartProps {
  buckets: MonthBucket[]
  categories: string[]
  colorOf: (categoryId: string) => string
  renderTooltipChip: (categoryId: string, count: number) => ReactNode
  renderPeakLabel: (categoryId: string) => ReactNode
  ariaLabel: string
  emptyMessage?: string
}

export function MonthlyLineTrendChart({
  buckets,
  categories,
  colorOf,
  renderTooltipChip,
  renderPeakLabel,
  ariaLabel,
  emptyMessage = 'No rides in this range.',
}: MonthlyLineTrendChartProps) {
  const [hover, setHover] = useState<HoverInfo | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const width = useElementWidth(containerRef, 640)

  const maxValue = Math.max(
    0,
    ...buckets.flatMap((b) => categories.map((c) => b.counts.get(c) ?? 0)),
  )
  const { ticks, niceMax } = computeYTicks(maxValue)

  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0)
  const monthWidth = buckets.length > 1 ? plotWidth / (buckets.length - 1) : 0
  const tickInterval = computeDateTickInterval(buckets.length)

  const yScale = (v: number) =>
    niceMax > 0 ? PLOT_HEIGHT - (v / niceMax) * PLOT_HEIGHT : PLOT_HEIGHT
  const xScale = (i: number) => (buckets.length > 1 ? i * monthWidth : plotWidth / 2)

  const svgHeight = MARGIN.top + PLOT_HEIGHT + MARGIN.bottom
  const hoveredBucket = hover ? buckets[hover.index] : null

  const seriesPaths = useMemo(
    () =>
      categories.map((categoryId) => {
        const points = buckets.map((bucket, i) => ({
          x: xScale(i),
          y: yScale(bucket.counts.get(categoryId) ?? 0),
          value: bucket.counts.get(categoryId) ?? 0,
        }))
        return { categoryId, points, d: smoothPath(points) }
      }),
    [buckets, categories, plotWidth, niceMax],
  )

  // Sparse peak labels: only the most prominent series get a direct label,
  // placed at their peak month, skipping any that would collide.
  const peakLabels = useMemo(() => {
    const candidates = seriesPaths
      .map((s) => {
        let peak = s.points[0]
        for (const p of s.points) if (p.value > peak.value) peak = p
        return { categoryId: s.categoryId, peak }
      })
      .filter((c) => niceMax > 0 && c.peak.value >= niceMax * 0.3)
      .sort((a, b) => b.peak.value - a.peak.value)

    const placed: typeof candidates = []
    for (const candidate of candidates) {
      const collides = placed.some(
        (p) =>
          Math.abs(p.peak.x - candidate.peak.x) < 28 &&
          Math.abs(p.peak.y - candidate.peak.y) < 20,
      )
      if (!collides) placed.push(candidate)
      if (placed.length >= 6) break
    }
    return placed
  }, [seriesPaths, niceMax])

  function updateHoverFromPointer(
    index: number,
    e: { clientX: number; clientY: number },
  ) {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setHover({ index, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  if (buckets.every((b) => b.total === 0)) {
    return <div className="stacked-chart-empty">{emptyMessage}</div>
  }

  return (
    <div className="stacked-chart trend-chart" ref={containerRef}>
      <svg
        width="100%"
        height={svgHeight}
        role="img"
        aria-label={ariaLabel}
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

          {seriesPaths.map((s) => (
            <path key={s.categoryId} d={s.d} className="trend-line" stroke={colorOf(s.categoryId)} />
          ))}

          {peakLabels.map(({ categoryId, peak }) => (
            <foreignObject
              key={categoryId}
              x={peak.x - 10}
              y={peak.y < 24 ? peak.y + 8 : peak.y - 28}
              width={20}
              height={20}
              className="trend-peak-label"
            >
              {renderPeakLabel(categoryId)}
            </foreignObject>
          ))}

          {hover && (
            <line
              x1={hover.x - MARGIN.left}
              x2={hover.x - MARGIN.left}
              y1={0}
              y2={PLOT_HEIGHT}
              className="crosshair"
            />
          )}

          {buckets.map((bucket, i) => (
            <rect
              key={bucket.date.toISOString()}
              x={monthWidth ? xScale(i) - monthWidth / 2 : 0}
              y={0}
              width={monthWidth || plotWidth}
              height={PLOT_HEIGHT}
              fill="transparent"
              tabIndex={0}
              role="img"
              aria-label={`${bucket.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}: ${bucket.total} rides`}
              onMouseEnter={(e) => updateHoverFromPointer(i, e)}
              onMouseMove={(e) => updateHoverFromPointer(i, e)}
              onFocus={() =>
                setHover({ index: i, x: MARGIN.left + xScale(i), y: MARGIN.top })
              }
            />
          ))}

          {(() => {
            let prevShownYear: number | null = null
            return buckets.map((bucket, i) => {
              const isRegularTick = i % tickInterval === 0
              const isLastBucket = i === buckets.length - 1
              const lastRegularIndex =
                Math.floor((buckets.length - 1) / tickInterval) * tickInterval
              const tooCloseToRegularTick =
                isLastBucket && buckets.length - 1 - lastRegularIndex < tickInterval / 2

              if (!isRegularTick && !(isLastBucket && !tooCloseToRegularTick)) {
                return null
              }

              const year = bucket.date.getFullYear()
              const showYear = i === 0 || prevShownYear !== year
              prevShownYear = year

              return (
                <text
                  key={`tick-${bucket.date.toISOString()}`}
                  x={xScale(i)}
                  y={PLOT_HEIGHT + 16}
                  className="axis-label x-axis-label"
                >
                  {bucket.date.toLocaleDateString('en-US', { month: 'short' })}
                  {showYear ? ` ${String(year).slice(2)}` : ''}
                </text>
              )
            })
          })()}
        </g>
      </svg>

      {hoveredBucket && hover && (
        <ChartTooltip
          bucket={hoveredBucket}
          categories={categories}
          renderChip={renderTooltipChip}
          x={hover.x}
          y={hover.y}
          containerWidth={width}
        />
      )}
    </div>
  )
}

function ChartTooltip({
  bucket,
  categories,
  renderChip,
  x,
  y,
  containerWidth,
}: {
  bucket: MonthBucket
  categories: string[]
  renderChip: (categoryId: string, count: number) => ReactNode
  x: number
  y: number
  containerWidth: number
}) {
  const rows = categories
    .map((id) => ({ id, count: bucket.counts.get(id) ?? 0 }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)

  const pct = containerWidth > 0 ? x / containerWidth : 0.5
  const hAnchor = pct < 0.15 ? 'is-left-edge' : pct > 0.85 ? 'is-right-edge' : ''
  const vAnchor = y < 110 ? 'is-top-edge' : ''

  return (
    <div className={`chart-tooltip ${hAnchor} ${vAnchor}`} style={{ left: x, top: y }} role="tooltip">
      <div className="chart-tooltip-date">
        {bucket.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </div>
      <div className="chart-tooltip-chips">
        {rows.map((row) => (
          <div key={row.id} className="chart-tooltip-chip">
            {renderChip(row.id, row.count)}
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
