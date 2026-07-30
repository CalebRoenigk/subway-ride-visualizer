import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Ride } from '../../types/ride'
import { Card } from '../common/Card'
import { getLineMeta } from '../../data/lines'
import { computeCarAggregates, type CarAggregate } from '../../utils/carAggregates'
import { formatRideDate } from '../../utils/date'
import './car-number-heatmap.css'

const ROW_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const LABELED_ROWS = new Set([1, 5, 9])
const COLS = 1000

interface PlacedMark extends CarAggregate {
  col: number
}

export function CarNumberHeatmap({ rides }: { rides: Ride[] }) {
  const rows = useMemo(() => {
    const aggregates = computeCarAggregates(rides)
    const byRow = new Map<number, PlacedMark[]>()

    for (const agg of aggregates.values()) {
      const num = Number.parseInt(agg.carNumber, 10)
      if (!Number.isFinite(num) || num < 1000 || num > 9999) continue
      const digit = Math.floor(num / 1000)
      const col = num % COLS
      const list = byRow.get(digit) ?? []
      list.push({ ...agg, col })
      byRow.set(digit, list)
    }

    return byRow
  }, [rides])

  const totalRidden = useMemo(() => {
    let n = 0
    rows.forEach((list) => (n += list.length))
    return n
  }, [rows])

  return (
    <Card title="Car Numbers" meta="All time">
      <div
        className="heatmap"
        role="img"
        aria-label={`Car number coverage grid: ${totalRidden} distinct 4-digit car numbers ridden, spanning 000 to 999 within each thousands range`}
      >
        <div className="heatmap-header">
          <div className="heatmap-row-label" aria-hidden="true" />
          <div className="heatmap-header-track">
            <span className="heatmap-col-label" style={{ left: '0%' }}>
              000
            </span>
            <span className="heatmap-col-label" style={{ left: '50%' }}>
              500
            </span>
            <span
              className="heatmap-col-label heatmap-col-label--end"
              style={{ left: '100%' }}
            >
              999
            </span>
          </div>
        </div>

        {ROW_DIGITS.map((digit) => (
          <div className="heatmap-row" key={digit}>
            <div className="heatmap-row-label">
              {LABELED_ROWS.has(digit) ? digit : ''}
            </div>
            <div className="heatmap-row-track">
              {(rows.get(digit) ?? []).map((mark) => (
                <HeatmapMark key={mark.carNumber} mark={mark} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="heatmap-footer">
        <Link to="/lookup" className="heatmap-table-link">
          View full car list →
        </Link>
      </div>
    </Card>
  )
}

function HeatmapMark({ mark }: { mark: PlacedMark }) {
  const meta = getLineMeta(mark.line)
  const pct = (mark.col / (COLS - 1)) * 100
  const edgeClass = pct < 5 ? 'is-left-edge' : pct > 95 ? 'is-right-edge' : ''

  return (
    <div
      className={`heatmap-mark ${edgeClass}`}
      style={{ left: `${pct}%`, background: meta.color }}
      tabIndex={0}
    >
      <div className="heatmap-tooltip">
        <div className="heatmap-tooltip-car">Car {mark.carNumber}</div>
        <div>
          {mark.line || 'Unknown'} line · {mark.count}{' '}
          {mark.count === 1 ? 'ride' : 'rides'}
        </div>
        <div className="heatmap-tooltip-muted">
          Last ridden {formatRideDate(mark.lastRidden)}
        </div>
      </div>
    </div>
  )
}
