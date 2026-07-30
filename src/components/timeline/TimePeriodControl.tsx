import { TIME_PERIOD_LABELS, type TimePeriod } from '../../utils/timePeriod'

export function TimePeriodControl({
  value,
  onChange,
}: {
  value: TimePeriod
  onChange: (period: TimePeriod) => void
}) {
  return (
    <label className="timeline-control">
      <span className="timeline-control-label">Time period</span>
      <select
        className="timeline-select"
        value={value}
        onChange={(e) => onChange(e.target.value as TimePeriod)}
      >
        {(Object.keys(TIME_PERIOD_LABELS) as TimePeriod[]).map((period) => (
          <option key={period} value={period}>
            {TIME_PERIOD_LABELS[period]}
          </option>
        ))}
      </select>
    </label>
  )
}
