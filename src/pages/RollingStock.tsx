import { useMemo, useState } from 'react'
import { useRides } from '../data/useRides'
import { useFleet } from '../data/useFleet'
import { getLineMeta } from '../data/lines'
import type { CarAggregate } from '../utils/carAggregates'
import { buildLineAssignment, buildTypeAssignment } from '../utils/categoryAssignment'
import { useIsDarkMode } from '../utils/useIsDarkMode'
import { LineBullet } from '../components/common/LineBullet'
import { CarNumberHeatmap } from '../components/heatmap/CarNumberHeatmap'
import { TopRiddenCars } from '../components/rolling-stock/TopRiddenCars'
import { FleetCoverageCard } from '../components/rolling-stock/FleetCoverageCard'
import { RiddenByYard } from '../components/rolling-stock/RiddenByYard'
import '../components/timeline/timeline-controls.css'
import '../components/charts/rides-by-line.css'
import './rolling-stock.css'

type ColorMode = 'count' | 'type' | 'line'

const MODE_LABELS: Record<ColorMode, string> = {
  count: 'Ride Count',
  type: 'Car Type',
  line: 'Line',
}

export function RollingStock() {
  const { rides, loading: ridesLoading } = useRides()
  const { fleet, loading: fleetLoading } = useFleet()
  const [colorMode, setColorMode] = useState<ColorMode>('count')
  const isDark = useIsDarkMode()

  const typeAssignment = useMemo(() => buildTypeAssignment(rides, isDark), [rides, isDark])
  const lineAssignment = useMemo(() => buildLineAssignment(rides), [rides])

  const colorOf = useMemo<((mark: CarAggregate) => string) | undefined>(() => {
    if (colorMode === 'type') {
      return (mark) => typeAssignment.colorOf(typeAssignment.remap(mark.carType || 'Unknown'))
    }
    if (colorMode === 'line') {
      return (mark) => getLineMeta(mark.line || 'Unknown').color
    }
    return undefined
  }, [colorMode, typeAssignment])

  const legend = useMemo(() => {
    if (colorMode === 'type') {
      return (
        <div className="color-key-items">
          {typeAssignment.order.map((id) => (
            <div key={id} className="color-key-item">
              <span
                className="color-key-swatch"
                style={{ background: typeAssignment.colorOf(id) }}
              />
              <span>{id}</span>
            </div>
          ))}
        </div>
      )
    }
    if (colorMode === 'line') {
      return (
        <div className="rides-by-line-legend">
          {lineAssignment.order.map((id) => (
            <div key={id} className="legend-item">
              <LineBullet line={id} size="sm" />
            </div>
          ))}
        </div>
      )
    }
    return undefined
  }, [colorMode, typeAssignment, lineAssignment])

  if (ridesLoading || fleetLoading) {
    return <div className="page-loading">Loading rides…</div>
  }

  return (
    <div className="page-stack">
      <div className="rolling-stock-row">
        <FleetCoverageCard rides={rides} fleet={fleet} />
        <TopRiddenCars rides={rides} />
      </div>

      <RiddenByYard rides={rides} fleet={fleet} />

      <CarNumberHeatmap
        rides={rides}
        colorOf={colorOf}
        legend={legend}
        meta={
          <select
            className="date-range-control"
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value as ColorMode)}
            aria-label="Color the heatmap by"
          >
            {(Object.keys(MODE_LABELS) as ColorMode[]).map((mode) => (
              <option key={mode} value={mode}>
                {MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        }
      />
    </div>
  )
}
