export type ColorByMode = 'line' | 'type'

const LABELS: Record<ColorByMode, string> = { line: 'Line', type: 'Type' }

export function ColorByControl({
  value,
  onChange,
}: {
  value: ColorByMode
  onChange: (mode: ColorByMode) => void
}) {
  return (
    <label className="timeline-control">
      <span className="timeline-control-label">Color by</span>
      <select
        className="timeline-select"
        value={value}
        onChange={(e) => onChange(e.target.value as ColorByMode)}
      >
        {(Object.keys(LABELS) as ColorByMode[]).map((mode) => (
          <option key={mode} value={mode}>
            {LABELS[mode]}
          </option>
        ))}
      </select>
    </label>
  )
}
