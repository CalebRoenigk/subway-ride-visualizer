import { useMemo } from 'react'
import { useRides } from '../data/useRides'
import { computeOverviewStats } from '../utils/stats'
import { formatLastUpdated } from '../utils/date'
import { StatsRow } from '../components/stats/StatsRow'
import { RidesByLineChart } from '../components/charts/RidesByLineChart'
import { LatestRides } from '../components/rides/LatestRides'
import { CarNumberHeatmap } from '../components/heatmap/CarNumberHeatmap'
import './overview.css'

export function Overview() {
  const { rides, isSample, loading } = useRides()
  const stats = useMemo(() => computeOverviewStats(rides), [rides])
  const lastUpdated = rides[0]?.timestamp

  if (loading) {
    return <div className="overview-loading">Loading rides…</div>
  }

  return (
    <div className="overview">
      {isSample && (
        <div className="sample-banner">
          Showing sample data. Export your Airtable base to CSV and save it
          as <code>public/data/rides.csv</code> to see your real rides — see{' '}
          <code>public/data/rides.example.csv</code> for the expected columns.
        </div>
      )}

      {lastUpdated && (
        <div className="last-updated">{formatLastUpdated(lastUpdated)}</div>
      )}

      <StatsRow stats={stats} />
      <RidesByLineChart rides={rides} />
      <LatestRides rides={rides} />
      <CarNumberHeatmap rides={rides} />
    </div>
  )
}
