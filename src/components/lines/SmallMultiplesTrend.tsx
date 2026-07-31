import type { ReactNode } from 'react'
import type { MonthBucket } from '../charts/chart-utils'
import './small-multiples-trend.css'

const VIEW_WIDTH = 100
const VIEW_HEIGHT = 36

function sparklinePath(values: number[], max: number): string {
  if (values.length === 0) return ''
  return values
    .map((v, i) => {
      const x = values.length > 1 ? (i / (values.length - 1)) * VIEW_WIDTH : VIEW_WIDTH / 2
      const y = max > 0 ? VIEW_HEIGHT - (v / max) * VIEW_HEIGHT : VIEW_HEIGHT
      return `${i === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')
}

export function SmallMultiplesTrend({
  buckets,
  categories,
  colorOf,
  renderLabel,
}: {
  buckets: MonthBucket[]
  categories: string[]
  colorOf: (categoryId: string) => string
  renderLabel: (categoryId: string) => ReactNode
}) {
  return (
    <div className="small-multiples-grid">
      {categories.map((id) => {
        const values = buckets.map((b) => b.counts.get(id) ?? 0)
        const total = values.reduce((a, b) => a + b, 0)
        const max = Math.max(0, ...values)
        const d = sparklinePath(values, max)
        const color = colorOf(id)

        return (
          <div className="small-multiple-panel" key={id}>
            <div className="small-multiple-header">
              {renderLabel(id)}
              <span className="small-multiple-total tabular">{total}</span>
            </div>
            <svg
              viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
              preserveAspectRatio="none"
              className="small-multiple-sparkline"
              role="img"
              aria-label={`${id}: ${total} rides total, monthly trend`}
            >
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        )
      })}
    </div>
  )
}
