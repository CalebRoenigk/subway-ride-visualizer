import type { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: ReactNode
  info?: string
}

export function StatTile({ label, value, info }: StatTileProps) {
  return (
    <div className="stat-tile">
      <div className="stat-tile-label">
        {label}
        {info && (
          <span className="stat-tile-info" tabIndex={0}>
            <span aria-hidden="true">ⓘ</span>
            <span role="tooltip" className="stat-tile-info-bubble">
              {info}
            </span>
          </span>
        )}
      </div>
      <div className="stat-tile-value">{value}</div>
    </div>
  )
}
