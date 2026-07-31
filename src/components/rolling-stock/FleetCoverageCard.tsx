import { useMemo } from 'react'
import type { Ride } from '../../types/ride'
import type { FleetRecord } from '../../data/loadFleet'
import { Card } from '../common/Card'
import './fleet-coverage-card.css'

export function FleetCoverageCard({
  rides,
  fleet,
}: {
  rides: Ride[]
  fleet: FleetRecord[]
}) {
  const { pct, riddenCount, activeTotal } = useMemo(() => {
    const activeUnits = new Set<string>()
    for (const record of fleet) {
      if (record.status !== 'Active') continue
      for (const unit of record.unitNumbers) activeUnits.add(unit)
    }

    const riddenActive = new Set<string>()
    for (const ride of rides) {
      if (activeUnits.has(ride.carNumber)) riddenActive.add(ride.carNumber)
    }

    const activeTotal = activeUnits.size
    const riddenCount = riddenActive.size
    return {
      pct: activeTotal > 0 ? (riddenCount / activeTotal) * 100 : 0,
      riddenCount,
      activeTotal,
    }
  }, [rides, fleet])

  return (
    <Card title="Fleet Ridden" meta="Active cars only">
      <div className="fleet-coverage">
        <div className="fleet-coverage-value tabular">{pct.toFixed(1)}%</div>
        <div className="fleet-coverage-caption">
          {riddenCount.toLocaleString()} of {activeTotal.toLocaleString()} active cars ridden
        </div>
      </div>
    </Card>
  )
}
