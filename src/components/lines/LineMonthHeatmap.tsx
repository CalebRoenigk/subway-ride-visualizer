import { Fragment, type ReactNode } from 'react'
import type { MonthBucket } from '../charts/chart-utils'
import { computeDateTickInterval } from '../charts/chart-utils'
import { getRideCountColor, getRideCountScaleStops } from '../../utils/colorScale'
import { useIsDarkMode } from '../../utils/useIsDarkMode'
import './line-month-heatmap.css'

export function LineMonthHeatmap({
  buckets,
  categories,
  renderRowLabel,
}: {
  buckets: MonthBucket[]
  categories: string[]
  renderRowLabel: (categoryId: string) => ReactNode
}) {
  const isDark = useIsDarkMode()
  const tickInterval = computeDateTickInterval(buckets.length)

  const maxValue = Math.max(
    0,
    ...buckets.flatMap((b) => categories.map((c) => b.counts.get(c) ?? 0)),
  )

  return (
    <div className="lmh-wrap">
      <div
        className="lmh-grid"
        style={{ gridTemplateColumns: `32px repeat(${buckets.length}, minmax(0, 1fr))` }}
      >
        <div className="lmh-corner" aria-hidden="true" />
        {buckets.map((bucket, i) => {
          const showLabel = i % tickInterval === 0 || i === buckets.length - 1
          return (
            <div key={bucket.date.toISOString()} className="lmh-month-label">
              {showLabel ? bucket.date.toLocaleDateString('en-US', { month: 'short' }) : ''}
            </div>
          )
        })}

        {categories.map((id) => (
          <Fragment key={id}>
            <div className="lmh-row-label">{renderRowLabel(id)}</div>
            {buckets.map((bucket, bi) => {
              const count = bucket.counts.get(id) ?? 0
              const color = count > 0 ? getRideCountColor(count, maxValue, isDark) : undefined
              const pct = buckets.length > 1 ? bi / (buckets.length - 1) : 0.5
              const edgeClass = pct < 0.08 ? 'is-left-edge' : pct > 0.92 ? 'is-right-edge' : ''
              return (
                <div
                  key={bucket.date.toISOString()}
                  className={`lmh-cell ${count === 0 ? 'is-empty' : ''} ${edgeClass}`}
                  style={color ? { background: color } : undefined}
                  tabIndex={count > 0 ? 0 : undefined}
                >
                  {count > 0 && (
                    <div className="lmh-tooltip">
                      <div className="lmh-tooltip-line">{id}</div>
                      <div>
                        {bucket.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </div>
                      <div className="lmh-tooltip-count">
                        {count} {count === 1 ? 'ride' : 'rides'}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>

      <div className="lmh-scale">
        <span className="lmh-scale-label">1 ride</span>
        <span
          className="lmh-scale-bar"
          style={{
            background: `linear-gradient(to right, ${getRideCountScaleStops(isDark).join(', ')})`,
          }}
        />
        <span className="lmh-scale-label">{maxValue} rides</span>
      </div>
    </div>
  )
}
