import { useRef, useState, type ReactNode } from 'react'
import { computeDateTickInterval, computeYTicks, type DayBucket } from './chart-utils'
import { useElementWidth } from './useElementWidth'
import './stacked-day-bar-chart.css'

const MARGIN = { top: 8, right: 8, bottom: 30, left: 34 }
const PLOT_HEIGHT = 200
const BAR_MAX_WIDTH = 24
const SEGMENT_GAP = 2

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

interface StackedDayBarChartProps {
  buckets: DayBucket[]
  categories: string[]
  colorOf: (categoryId: string) => string
  renderTooltipChip: (categoryId: string, count: number) => ReactNode
  ariaLabel: string
  emptyMessage?: string
}

export function StackedDayBarChart({
  buckets,
  categories,
  colorOf,
  renderTooltipChip,
  ariaLabel,
  emptyMessage = 'No rides in this range.',
}: StackedDayBarChartProps) {
  const [hover, setHover] = useState<HoverInfo | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const width = useElementWidth(containerRef, 640)

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
    <div className="stacked-chart" ref={containerRef}>
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

          {buckets.map((bucket, i) => {
            const slotX = i * dayWidth
            const barX = slotX + (dayWidth - barWidth) / 2
            let cumulative = 0
            const segments = categories
              .map((categoryId) => bucket.counts.get(categoryId) ?? 0)
              .map((value, idx) => {
                const categoryId = categories[idx]
                const y0 = cumulative
                cumulative += value
                return { categoryId, value, y0, y1: cumulative }
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
                  const color = colorOf(seg.categoryId)
                  return isTop ? (
                    <path
                      key={seg.categoryId}
                      d={roundedTopPath(barX, y, barWidth, height, 4)}
                      fill={color}
                    />
                  ) : (
                    <rect
                      key={seg.categoryId}
                      x={barX}
                      y={y}
                      width={barWidth}
                      height={height}
                      fill={color}
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
                    hasData ? (e) => updateHoverFromPointer(i, e) : undefined
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
            const isRegularTick = i % tickInterval === 0
            const isLastBucket = i === buckets.length - 1
            const lastRegularIndex =
              Math.floor((buckets.length - 1) / tickInterval) * tickInterval
            const tooCloseToRegularTick =
              isLastBucket && buckets.length - 1 - lastRegularIndex < tickInterval / 2

            if (!isRegularTick && !(isLastBucket && !tooCloseToRegularTick)) {
              return null
            }
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
                  <text x={x} y={PLOT_HEIGHT + 26} className="axis-label x-axis-month">
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
  bucket: DayBucket
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
