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
  onSelectCar,
}: {
  consist: FleetRecord
  searchedCar: string
  countOf: (carNumber: string) => number
  onSelectCar?: (unit: string) => void
}) {
  return (
    <div className="trainset-row">
      {consist.unitNumbers.map((unit) => {
        const count = countOf(unit)
        const isSearched = unit === searchedCar
        const isClickable = !isSearched && count > 0
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
            className={`trainset-tile ${isSearched ? 'is-searched' : ''} ${isClickable ? 'is-clickable' : ''}`}
            style={{ background, color }}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={isClickable ? () => onSelectCar?.(unit) : undefined}
            onKeyDown={
              isClickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelectCar?.(unit)
                    }
                  }
                : undefined
            }
          >
            <span className="trainset-tile-car">{unit}</span>
            <span className="trainset-tile-count tabular">{count}</span>
          </div>
        )
      })}
    </div>
  )
}
