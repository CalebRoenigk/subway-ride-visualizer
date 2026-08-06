import { LineBullet } from '../common/LineBullet'
import { ChevronIcon } from '../common/ChevronIcon'
import { getContrastText, getLineMeta } from '../../data/lines'
import { useDismissablePopover } from '../../utils/useDismissablePopover'
import '../common/dropdown.css'
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
  const { open, setOpen, toggle, ref } = useDismissablePopover<HTMLDivElement>()

  return (
    <label className="timeline-control">
      <span className="timeline-control-label">Line</span>
      <div className="line-select-wrap" ref={ref}>
        <button
          type="button"
          className={`line-select-trigger ${open ? 'is-open' : ''}`}
          onClick={toggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Select a line"
        >
          <span
            className="line-select-visual"
            style={{ background: meta.color, color: getContrastText(meta.color) }}
            aria-hidden="true"
          >
            {value}
          </span>
          <span className="line-select-label-stack">
            {lines.map((line) => (
              <span
                key={line}
                className={`line-select-label-ghost ${line === value ? 'is-visible' : ''}`}
              >
                {line} line
              </span>
            ))}
          </span>
          <span className={`line-select-chevron ${open ? 'is-open' : ''}`}>
            <ChevronIcon />
          </span>
        </button>

        {open && (
          <div className="dropdown-panel line-select-panel" role="listbox">
            <div className="dropdown-options">
              {lines.map((line) => (
                <button
                  key={line}
                  type="button"
                  role="option"
                  aria-selected={line === value}
                  className={`dropdown-option ${line === value ? 'is-active' : ''}`}
                  onClick={() => {
                    onChange(line)
                    setOpen(false)
                  }}
                >
                  <LineBullet line={line} size="sm" />
                  <span>{line} line</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </label>
  )
}
