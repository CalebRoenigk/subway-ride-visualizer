import { useRef, useState } from 'react'
import {
  computeDateTickInterval,
  computeYTicks,
  roundedTopPath,
  type MonthBucket,
} from '../charts/chart-utils'
import { useElementWidth } from '../charts/useElementWidth'
import '../charts/stacked-day-bar-chart.css'
import './car-monthly-chart.css'

const MARGIN = { top: 8, right: 8, bottom: 24, left: 34 }
const PLOT_HEIGHT = 180
const BAR_MAX_WIDTH = 20

export function CarMonthlyChart({ buckets }: { buckets: MonthBucket[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const width = useElementWidth(containerRef, 640)

  const maxValue = Math.max(0, ...buckets.map((b) => b.total))
  const { ticks, niceMax } = computeYTicks(maxValue)
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0)
  const monthWidth = buckets.length ? plotWidth / buckets.length : 0
  const barWidth = Math.max(Math.min(BAR_MAX_WIDTH, monthWidth * 0.6), 2)
  const tickInterval = computeDateTickInterval(buckets.length)
  const yScale = (v: number) =>
    niceMax > 0 ? PLOT_HEIGHT - (v / niceMax) * PLOT_HEIGHT : PLOT_HEIGHT
  const svgHeight = MARGIN.top + PLOT_HEIGHT + MARGIN.bottom

  if (buckets.every((b) => b.total === 0)) {
    return <div className="stacked-chart-empty">No rides logged for this car yet.</div>
  }

  return (
    <div className="stacked-chart" ref={containerRef}>
      <svg
        width="100%"
        height={svgHeight}
        role="img"
        aria-label="Rides by month for this car"
        onMouseLeave={() => setHoverIndex(null)}
      >
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
            const slotX = i * monthWidth
            const barX = slotX + (monthWidth - barWidth) / 2
            const top = yScale(bucket.total)
            const barHeight = PLOT_HEIGHT - top
            const isHovered = hoverIndex === i
            const hasData = bucket.total > 0

            return (
              <g key={bucket.date.toISOString()}>
                {isHovered && (
                  <rect x={slotX} y={0} width={monthWidth} height={PLOT_HEIGHT} className="hover-band" />
                )}
                {hasData && (
                  <path
                    d={roundedTopPath(barX, top, barWidth, barHeight, 4)}
                    className="car-monthly-bar"
                  />
                )}
                <rect
                  x={slotX}
                  y={0}
                  width={monthWidth}
                  height={PLOT_HEIGHT}
                  fill="transparent"
                  tabIndex={hasData ? 0 : undefined}
                  role={hasData ? 'img' : undefined}
                  aria-label={
                    hasData
                      ? `${bucket.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}: ${bucket.total} rides`
                      : undefined
                  }
                  onMouseEnter={() => setHoverIndex(i)}
                  onFocus={() => setHoverIndex(i)}
                />
              </g>
            )
          })}

          {buckets.map((bucket, i) => {
            const showLabel = i % tickInterval === 0 || i === buckets.length - 1
            if (!showLabel) return null
            const x = i * monthWidth + monthWidth / 2
            return (
              <text
                key={`tick-${bucket.date.toISOString()}`}
                x={x}
                y={PLOT_HEIGHT + 16}
                className="axis-label x-axis-label"
              >
                {bucket.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              </text>
            )
          })}
        </g>
      </svg>

      {hoverIndex !== null && (
        <div
          className="chart-tooltip car-monthly-tooltip"
          style={{ left: MARGIN.left + hoverIndex * monthWidth + monthWidth / 2 }}
          role="tooltip"
        >
          <div className="chart-tooltip-date">
            {buckets[hoverIndex].date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <div className="chart-tooltip-total">
            <span>Rides</span>
            <span className="chart-tooltip-value">{buckets[hoverIndex].total}</span>
          </div>
        </div>
      )}
    </div>
  )
}
