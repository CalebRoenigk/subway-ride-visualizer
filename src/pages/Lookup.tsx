import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useRides } from '../data/useRides'
import { useFleet } from '../data/useFleet'
import { findConsist } from '../data/loadFleet'
import { bucketRidesByMonth } from '../components/charts/chart-utils'
import { Card } from '../components/common/Card'
import { LineBullet } from '../components/common/LineBullet'
import { StatTile } from '../components/stats/StatTile'
import { LatestRides } from '../components/rides/LatestRides'
import { CarSearchInput } from '../components/lookup/CarSearchInput'
import { CarMonthlyChart } from '../components/lookup/CarMonthlyChart'
import { TrainsetRow } from '../components/lookup/TrainsetRow'
import { formatRideDate, formatRideTime } from '../utils/date'
import '../components/stats/stats.css'
import './lookup.css'

export function Lookup() {
  const { rides, loading: ridesLoading } = useRides()
  const { fleet, loading: fleetLoading } = useFleet()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('car') ?? '')
  const carNumber = query.trim()

  const earliest = useMemo(
    () =>
      rides.length
        ? new Date(Math.min(...rides.map((r) => r.timestamp.getTime())))
        : null,
    [rides],
  )
  const latest = useMemo(
    () =>
      rides.length
        ? new Date(Math.max(...rides.map((r) => r.timestamp.getTime())))
        : new Date(),
    [rides],
  )

  const carCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const ride of rides) {
      counts.set(ride.carNumber, (counts.get(ride.carNumber) ?? 0) + 1)
    }
    return counts
  }, [rides])

  const carRides = useMemo(
    () => (carNumber ? rides.filter((r) => r.carNumber === carNumber) : []),
    [rides, carNumber],
  )

  const linesForCar = useMemo(() => {
    const seen = new Set<string>()
    const ordered: string[] = []
    for (const ride of carRides) {
      const line = ride.line || 'Unknown'
      if (!seen.has(line)) {
        seen.add(line)
        ordered.push(line)
      }
    }
    return ordered
  }, [carRides])

  const monthlyBuckets = useMemo(
    () => (carNumber && earliest ? bucketRidesByMonth(carRides, earliest, latest, () => 'rides') : []),
    [carRides, earliest, latest, carNumber],
  )

  const consist = useMemo(
    () => (carNumber ? findConsist(fleet, carNumber) : undefined),
    [fleet, carNumber],
  )

  if (ridesLoading || fleetLoading) {
    return <div className="page-loading">Loading rides…</div>
  }

  return (
    <div className="page-stack">
      <CarSearchInput value={query} onChange={setQuery} />

      {!carNumber && (
        <div className="lookup-empty">
          Type a car number above to look up its ride history.
        </div>
      )}

      {carNumber && carRides.length === 0 && (
        <div className="lookup-empty">No rides logged for car {carNumber} yet.</div>
      )}

      {carNumber && carRides.length > 0 && (
        <>
          <div className="stats-row">
            <StatTile label="Car Number" value={carNumber} />
            <StatTile
              label="Line(s)"
              value={
                <div className="lookup-line-bullets">
                  {linesForCar.map((line) => (
                    <LineBullet key={line} line={line} size="sm" />
                  ))}
                </div>
              }
            />
            <StatTile label="Times Ridden" value={carRides.length.toLocaleString()} />
            <StatTile
              label="Most Recent Ride"
              value={formatRideDate(carRides[0].timestamp)}
              info={`${formatRideTime(carRides[0].timestamp)} on ${formatRideDate(carRides[0].timestamp)}`}
            />
          </div>

          <Card title="Rides">
            <CarMonthlyChart buckets={monthlyBuckets} />
          </Card>

          <LatestRides rides={carRides} />

          {consist && (
            <Card title="Trainset">
              <TrainsetRow
                consist={consist}
                searchedCar={carNumber}
                countOf={(unit) => carCounts.get(unit) ?? 0}
              />
            </Card>
          )}
        </>
      )}
    </div>
  )
}
