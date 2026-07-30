import { StatTile } from './StatTile'
import type { OverviewStats } from '../../utils/stats'
import './stats.css'

export function StatsRow({ stats }: { stats: OverviewStats }) {
  const repeatInfo = stats.mostRepeat
    ? `Car ${stats.mostRepeat.carNumber}${
        stats.mostRepeat.line ? ` (${stats.mostRepeat.line} line)` : ''
      } — ridden ${stats.mostRepeat.count} times`
    : 'No repeat rides yet'

  return (
    <div className="stats-row">
      <StatTile label="Total Rides" value={stats.totalRides.toLocaleString()} />
      <StatTile label="Unique Cars" value={stats.uniqueCars.toLocaleString()} />
      <StatTile
        label="Lines Ridden"
        value={`${stats.linesRidden}/${stats.linesTotal}`}
      />
      <StatTile
        label="Most Repeat Rides"
        value={stats.mostRepeat?.count ?? 0}
        info={repeatInfo}
      />
    </div>
  )
}
