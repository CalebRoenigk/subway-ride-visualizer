import { getContrastText, getLineMeta } from '../../data/lines'
import './line-select-control.css'

export function LineSelectControl({
  lines,
  value,
  onChange,
}: {
  lines: string[]
  value: string
  onChange: (line: string) => void
}) {
  const meta = getLineMeta(value)

  return (
    <label className="timeline-control">
      <span className="timeline-control-label">Line</span>
      <span className="line-select-wrap">
        <select
          className="line-select"
          style={{ background: meta.color, color: getContrastText(meta.color) }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Select a line"
        >
          {lines.map((line) => (
            <option key={line} value={line}>
              {line}
            </option>
          ))}
        </select>
        <span className="line-select-chevron" aria-hidden="true">
          ⌄
        </span>
      </span>
    </label>
  )
}
