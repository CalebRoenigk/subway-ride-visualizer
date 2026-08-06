import { useMemo } from 'react'
import type { Ride } from '../../types/ride'
import type { FleetRecord } from '../../data/loadFleet'
import { Card } from '../common/Card'
import './ridden-by-yard.css'

interface YardRow {
  yard: string
  riddenCount: number
  total: number
  pct: number
}

export function RiddenByYard({
  rides,
  fleet,
}: {
  rides: Ride[]
  fleet: FleetRecord[]
}) {
  const rows = useMemo<YardRow[]>(() => {
    const byYard = new Map<string, Set<string>>()
    for (const record of fleet) {
      if (record.status !== 'Active') continue
      const yard = record.yardAssigned || 'Unassigned'
      const set = byYard.get(yard) ?? new Set<string>()
      for (const unit of record.unitNumbers) set.add(unit)
      byYard.set(yard, set)
    }

    const riddenCars = new Set(rides.map((r) => r.carNumber))

    return [...byYard.entries()]
      .map(([yard, units]) => {
        const total = units.size
        let riddenCount = 0
        units.forEach((unit) => {
          if (riddenCars.has(unit)) riddenCount += 1
        })
        return { yard, riddenCount, total, pct: total > 0 ? (riddenCount / total) * 100 : 0 }
      })
      .sort((a, b) => b.pct - a.pct)
  }, [rides, fleet])

  return (
    <Card title="Ridden by Yard" meta="Share of each yard's active fleet ridden">
      {rows.length === 0 ? (
        <div className="stacked-chart-empty">No fleet data available.</div>
      ) : (
        <div className="yard-list">
          {rows.map((row) => (
            <div className="yard-row" key={row.yard}>
              <div className="yard-row-top">
                <span className="yard-label">{row.yard}</span>
                <span className="yard-count tabular">
                  {row.riddenCount}/{row.total}
                </span>
              </div>
              <div className="yard-track">
                <div className="yard-fill" style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
