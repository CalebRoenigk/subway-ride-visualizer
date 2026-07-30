export type RangePreset = '7d' | '30d' | '90d' | 'all'

const PRESET_LABELS: Record<RangePreset, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  all: 'All time',
}

export function DateRangeControl({
  value,
  onChange,
}: {
  value: RangePreset
  onChange: (preset: RangePreset) => void
}) {
  return (
    <select
      className="date-range-control"
      value={value}
      onChange={(e) => onChange(e.target.value as RangePreset)}
      aria-label="Date range"
    >
      {(Object.keys(PRESET_LABELS) as RangePreset[]).map((preset) => (
        <option key={preset} value={preset}>
          {PRESET_LABELS[preset]}
        </option>
      ))}
    </select>
  )
}
