import { getContrastText } from '../../data/lines'
import type { FleetRecord } from '../../data/loadFleet'
import './trainset-row.css'

// Matches --text-muted (same value in both themes) — the same neutral gray
// used for the "Rides" bar chart, so a ridden-but-not-searched car always
// reads as one consistent color regardless of how many times it was ridden.
const RIDDEN_COLOR = '#898781'

export function TrainsetRow({
  consist,
  searchedCar,
  countOf,
}: {
  consist: FleetRecord
  searchedCar: string
  countOf: (carNumber: string) => number
}) {
  return (
    <div className="trainset-row">
      {consist.unitNumbers.map((unit) => {
        const count = countOf(unit)
        const isSearched = unit === searchedCar
        const background = isSearched
          ? 'var(--text-primary)'
          : count > 0
            ? RIDDEN_COLOR
            : 'var(--gridline)'
        const color = isSearched
          ? 'var(--surface-1)'
          : count > 0
            ? getContrastText(RIDDEN_COLOR)
            : 'var(--text-muted)'

        return (
          <div
            key={unit}
            className={`trainset-tile ${isSearched ? 'is-searched' : ''}`}
            style={{ background, color }}
            title={`Car ${unit}: ${count} ${count === 1 ? 'ride' : 'rides'}`}
          >
            <span className="trainset-tile-car">{unit}</span>
            <span className="trainset-tile-count tabular">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
