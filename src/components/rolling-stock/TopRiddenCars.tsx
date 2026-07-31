import { useMemo } from 'react'
import type { Ride } from '../../types/ride'
import { Card } from '../common/Card'
import { LineBullet } from '../common/LineBullet'
import { computeCarAggregates } from '../../utils/carAggregates'
import './top-ridden-cars.css'

export function TopRiddenCars({ rides }: { rides: Ride[] }) {
  const top = useMemo(() => {
    const aggregates = [...computeCarAggregates(rides).values()]
    return aggregates
      .sort((a, b) => b.count - a.count || b.lastRidden.getTime() - a.lastRidden.getTime())
      .slice(0, 5)
  }, [rides])

  return (
    <Card title="Top 5 Re-ridden Cars">
      {top.length === 0 ? (
        <div className="top-cars-empty">No rides logged yet.</div>
      ) : (
        <ol className="top-cars-list">
          {top.map((car, i) => (
            <li key={car.carNumber} className="top-car-row">
              <span className="top-car-rank">{i + 1}</span>
              {car.line && <LineBullet line={car.line} size="sm" />}
              <span className="top-car-number">{car.carNumber}</span>
              <span className="top-car-type">{car.carType || 'Unknown'}</span>
              <span className="top-car-count tabular">
                {car.count} {car.count === 1 ? 'ride' : 'rides'}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
