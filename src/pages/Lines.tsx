import { useMemo, useState } from 'react'
import { useRides } from '../data/useRides'
import { getLineMeta } from '../data/lines'
import { buildLineAssignment } from '../utils/categoryAssignment'
import { bucketRidesByMonth, bucketRidesByHour } from '../components/charts/chart-utils'
import { Card } from '../components/common/Card'
import { LineBullet } from '../components/common/LineBullet'
import { LinesKey } from '../components/lines/LinesKey'
import { SmallMultiplesTrend } from '../components/lines/SmallMultiplesTrend'
import { TopLinesBar } from '../components/lines/TopLinesBar'
import { RidesByHourChart } from '../components/lines/RidesByHourChart'
import { TypeDistributionBar } from '../components/lines/TypeDistributionBar'
import { LineSelectControl } from '../components/lines/LineSelectControl'
import './lines-page.css'

export function Lines() {
  const { rides, loading } = useRides()
  const [selectedLineOverride, setSelectedLineOverride] = useState<string | null>(null)

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

  const assignment = useMemo(() => buildLineAssignment(rides), [rides])

  const monthlyBuckets = useMemo(
    () =>
      earliest
        ? bucketRidesByMonth(rides, earliest, latest, (r) => r.line || 'Unknown')
        : [],
    [rides, earliest, latest],
  )

  const lineCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const ride of rides) {
      const line = ride.line || 'Unknown'
      counts.set(line, (counts.get(line) ?? 0) + 1)
    }
    return counts
  }, [rides])

  const linesByVolume = useMemo(
    () => [...lineCounts.entries()].sort((a, b) => b[1] - a[1]).map(([line]) => line),
    [lineCounts],
  )

  const selectedLine = selectedLineOverride ?? linesByVolume[0] ?? ''
  const selectedLineRides = useMemo(
    () => rides.filter((r) => (r.line || 'Unknown') === selectedLine),
    [rides, selectedLine],
  )
  const hourBuckets = useMemo(
    () => bucketRidesByHour(selectedLineRides),
    [selectedLineRides],
  )
  const selectedLineColor = getLineMeta(selectedLine).color

  if (loading) {
    return <div className="page-loading">Loading rides…</div>
  }

  return (
    <div className="page-stack">
      <LinesKey />

      <Card title="Rides">
        <SmallMultiplesTrend
          buckets={monthlyBuckets}
          categories={linesByVolume}
          colorOf={assignment.colorOf}
          renderLabel={(id) => <LineBullet line={id} size="sm" />}
        />
      </Card>

      <div className="lines-page-row">
        <TopLinesBar rides={rides} limit={10} />

        <Card
          title="Rides by Hour"
          meta={
            <LineSelectControl
              lines={linesByVolume}
              value={selectedLine}
              onChange={setSelectedLineOverride}
            />
          }
        >
          <RidesByHourChart buckets={hourBuckets} color={selectedLineColor} />
        </Card>
      </div>

      <Card title="Type Distribution">
        <TypeDistributionBar rides={rides} />
      </Card>
    </div>
  )
}
