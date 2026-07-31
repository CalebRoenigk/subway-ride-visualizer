import { StyledSelect } from '../common/StyledSelect'

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
    <StyledSelect
      value={value}
      onChange={onChange}
      ariaLabel="Date range"
      options={(Object.keys(PRESET_LABELS) as RangePreset[]).map((preset) => ({
        value: preset,
        label: PRESET_LABELS[preset],
      }))}
    />
  )
}
