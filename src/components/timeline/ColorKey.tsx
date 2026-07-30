import { LineBullet } from '../common/LineBullet'
import type { ColorByMode } from './ColorByControl'
import './timeline-controls.css'

export function ColorKey({
  mode,
  order,
  colorOf,
}: {
  mode: ColorByMode
  order: string[]
  colorOf: (id: string) => string
}) {
  if (order.length === 0) return null

  return (
    <div className="color-key">
      <span className="color-key-label">Color Key</span>
      <div className="color-key-items">
        {order.map((id) =>
          mode === 'line' ? (
            <LineBullet key={id} line={id} size="sm" />
          ) : (
            <div key={id} className="color-key-item">
              <span
                className="color-key-swatch"
                style={{ background: colorOf(id) }}
              />
              <span>{id}</span>
            </div>
          ),
        )}
      </div>
    </div>
  )
}
