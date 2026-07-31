import { StyledSelect } from '../common/StyledSelect'

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
      <StyledSelect
        value={value}
        onChange={onChange}
        ariaLabel="Color by"
        options={(Object.keys(LABELS) as ColorByMode[]).map((mode) => ({
          value: mode,
          label: LABELS[mode],
        }))}
      />
    </label>
  )
}
