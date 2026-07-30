import type { Ride } from '../../types/ride'
import { Card } from '../common/Card'
import { LineBullet } from '../common/LineBullet'
import { formatRideDate, formatRideTime } from '../../utils/date'
import './latest-rides.css'

export function LatestRides({ rides }: { rides: Ride[] }) {
  const latest = rides.slice(0, 5)

  return (
    <Card title="Latest Rides">
      {latest.length === 0 ? (
        <div className="latest-rides-empty">No rides logged yet.</div>
      ) : (
        <ul className="latest-rides-list">
          {latest.map((ride) => (
            <li key={ride.id} className="latest-ride-card">
              <div className="latest-ride-headline">
                {ride.line && <LineBullet line={ride.line} />}
                <span className="latest-ride-car">{ride.carNumber}</span>
              </div>
              <div className="latest-ride-time">
                {formatRideTime(ride.timestamp)}
                {'  '}
                {formatRideDate(ride.timestamp)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
