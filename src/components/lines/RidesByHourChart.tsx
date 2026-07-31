import { useRef, useState } from 'react'
import { computeYTicks, roundedTopPath, type HourBucket } from '../charts/chart-utils'
import { useElementWidth } from '../charts/useElementWidth'
import '../charts/stacked-day-bar-chart.css'
import './rides-by-hour-chart.css'

const MARGIN = { top: 8, right: 8, bottom: 24, left: 30 }
const PLOT_HEIGHT = 140
const BAR_MAX_WIDTH = 16
const TICK_HOURS = [0, 3, 6, 9, 12, 15, 18, 21]

function formatHourLabel(hour: number): string {
  const period = hour < 12 ? 'a' : 'p'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}${period}`
}

export function RidesByHourChart({
  buckets,
  color,
}: {
  buckets: HourBucket[]
  color: string
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const width = useElementWidth(containerRef, 500)

  const maxCount = Math.max(0, ...buckets.map((b) => b.count))
  const { ticks, niceMax } = computeYTicks(maxCount)
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0)
  const hourWidth = plotWidth / 24
  const barWidth = Math.max(Math.min(BAR_MAX_WIDTH, hourWidth * 0.6), 2)
  const yScale = (v: number) =>
    niceMax > 0 ? PLOT_HEIGHT - (v / niceMax) * PLOT_HEIGHT : PLOT_HEIGHT
  const svgHeight = MARGIN.top + PLOT_HEIGHT + MARGIN.bottom

  if (buckets.every((b) => b.count === 0)) {
    return <div className="stacked-chart-empty">No rides yet for this line.</div>
  }

  return (
    <div className="stacked-chart" ref={containerRef}>
      <svg width="100%" height={svgHeight} role="img" aria-label="Rides by hour of day">
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={0} x2={plotWidth} y1={yScale(t)} y2={yScale(t)} className="gridline" />
              <text x={-8} y={yScale(t)} className="axis-label y-axis-label">
                {t.toLocaleString()}
              </text>
            </g>
          ))}
          <line x1={0} x2={plotWidth} y1={PLOT_HEIGHT} y2={PLOT_HEIGHT} className="baseline" />

          {buckets.map((bucket, i) => {
            const barX = i * hourWidth + (hourWidth - barWidth) / 2
            const top = yScale(bucket.count)
            const barHeight = PLOT_HEIGHT - top
            const isHovered = hoverIndex === i
            const hasData = bucket.count > 0

            return (
              <g key={bucket.hour}>
                {isHovered && (
                  <rect x={i * hourWidth} y={0} width={hourWidth} height={PLOT_HEIGHT} className="hover-band" />
                )}
                {hasData && (
                  <path d={roundedTopPath(barX, top, barWidth, barHeight, 4)} fill={color} />
                )}
                <rect
                  x={i * hourWidth}
                  y={0}
                  width={hourWidth}
                  height={PLOT_HEIGHT}
                  fill="transparent"
                  tabIndex={hasData ? 0 : undefined}
                  role={hasData ? 'img' : undefined}
                  aria-label={hasData ? `${formatHourLabel(bucket.hour)}: ${bucket.count} rides` : undefined}
                  onMouseEnter={hasData ? () => setHoverIndex(i) : undefined}
                  onFocus={hasData ? () => setHoverIndex(i) : undefined}
                  onMouseLeave={() => setHoverIndex(null)}
                />
              </g>
            )
          })}

          {TICK_HOURS.map((hour) => (
            <text
              key={hour}
              x={hour * hourWidth + hourWidth / 2}
              y={PLOT_HEIGHT + 16}
              className="axis-label x-axis-label"
            >
              {formatHourLabel(hour)}
            </text>
          ))}
        </g>
      </svg>

      {hoverIndex !== null && (
        <div
          className="chart-tooltip hour-tooltip"
          style={{ left: MARGIN.left + hoverIndex * hourWidth + hourWidth / 2 }}
          role="tooltip"
        >
          <div className="chart-tooltip-date">{formatHourLabel(buckets[hoverIndex].hour)}</div>
          <div className="chart-tooltip-total">
            <span>Rides</span>
            <span className="chart-tooltip-value">{buckets[hoverIndex].count}</span>
          </div>
        </div>
      )}
    </div>
  )
}
