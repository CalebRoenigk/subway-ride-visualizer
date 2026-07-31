import './styled-select.css'

interface StyledSelectOption<T extends string> {
  value: T
  label: string
}

export function StyledSelect<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T
  onChange: (value: T) => void
  options: StyledSelectOption<T>[]
  ariaLabel?: string
}) {
  return (
    <span className="styled-select-wrap">
      <select
        className="styled-select"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={ariaLabel}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="styled-select-chevron" aria-hidden="true">
        ⌄
      </span>
    </span>
  )
}
