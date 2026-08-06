import { useDismissablePopover } from '../../utils/useDismissablePopover'
import { ChevronIcon } from './ChevronIcon'
import './dropdown.css'
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
  const { open, setOpen, toggle, ref } = useDismissablePopover<HTMLDivElement>()

  return (
    <div className="styled-select-wrap" ref={ref}>
      <button
        type="button"
        className={`styled-select-trigger ${open ? 'is-open' : ''}`}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className="styled-select-label-stack">
          {options.map((opt) => (
            <span
              key={opt.value}
              className={`styled-select-label-ghost ${opt.value === value ? 'is-visible' : ''}`}
            >
              {opt.label}
            </span>
          ))}
        </span>
        <span className={`styled-select-chevron ${open ? 'is-open' : ''}`}>
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div className="dropdown-panel styled-select-panel" role="listbox">
          <div className="dropdown-options">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={opt.value === value}
                className={`dropdown-option ${opt.value === value ? 'is-active' : ''}`}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
