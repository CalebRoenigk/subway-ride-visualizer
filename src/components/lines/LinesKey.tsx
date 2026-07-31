import { LINES } from '../../data/lines'
import { LineBullet } from '../common/LineBullet'
import './lines-key.css'

export function LinesKey() {
  return (
    <div className="lines-key">
      <span className="lines-key-label">Lines</span>
      <div className="lines-key-items">
        {LINES.map((line) => (
          <LineBullet key={line.id} line={line.id} size="sm" />
        ))}
      </div>
    </div>
  )
}
