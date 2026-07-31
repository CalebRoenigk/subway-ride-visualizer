import './car-search-input.css'

export function CarSearchInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="car-search">
      <span className="car-search-icon" aria-hidden="true">
        ⌕
      </span>
      <input
        type="text"
        inputMode="numeric"
        className="car-search-input"
        placeholder="Type Car Number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Type a car number to look it up"
      />
    </label>
  )
}
