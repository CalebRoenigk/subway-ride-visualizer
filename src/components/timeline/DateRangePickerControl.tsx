import { useEffect, useMemo, useRef, useState } from 'react'
import {
  RANGE_PRESET_LABELS,
  RANGE_PRESET_ORDER,
  formatRangeLabel,
  fromDateInputValue,
  getPresetRange,
  isSameDay,
  toDateInputValue,
  type RangePresetId,
} from '../../utils/dateRangePresets'
import './date-range-picker.css'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

interface DateRangePickerControlProps {
  preset: RangePresetId
  start: Date
  end: Date
  earliest: Date | null
  onApply: (preset: RangePresetId, start: Date, end: Date) => void
}

function buildMonthGrid(year: number, month: number): (Date | null)[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()
  const cells: (Date | null)[] = Array.from({ length: firstWeekday }, () => null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day))
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export function DateRangePickerControl({
  preset,
  start,
  end,
  earliest,
  onApply,
}: DateRangePickerControlProps) {
  const [open, setOpen] = useState(false)
  const [pendingPreset, setPendingPreset] = useState<RangePresetId>(preset)
  const [pendingStart, setPendingStart] = useState(start)
  const [pendingEnd, setPendingEnd] = useState(end)
  const [awaitingSecondClick, setAwaitingSecondClick] = useState(false)
  const [cursor, setCursor] = useState(() => new Date(start.getFullYear(), start.getMonth(), 1))
  const containerRef = useRef<HTMLDivElement>(null)

  const today = useMemo(() => new Date(), [])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function openPanel() {
    setPendingPreset(preset)
    setPendingStart(start)
    setPendingEnd(end)
    setAwaitingSecondClick(false)
    setCursor(new Date(start.getFullYear(), start.getMonth(), 1))
    setOpen(true)
  }

  function selectPreset(id: RangePresetId) {
    setPendingPreset(id)
    setAwaitingSecondClick(false)
    if (id === 'custom') return
    const range = getPresetRange(id, today, earliest)
    if (range) {
      setPendingStart(range.start)
      setPendingEnd(range.end)
      setCursor(new Date(range.start.getFullYear(), range.start.getMonth(), 1))
    }
  }

  function handleDayClick(day: Date) {
    setPendingPreset('custom')
    if (!awaitingSecondClick) {
      setPendingStart(day)
      setPendingEnd(day)
      setAwaitingSecondClick(true)
    } else {
      if (day < pendingStart) {
        setPendingEnd(pendingStart)
        setPendingStart(day)
      } else {
        setPendingEnd(day)
      }
      setAwaitingSecondClick(false)
    }
  }

  function handleStartInput(value: string) {
    const parsed = fromDateInputValue(value)
    if (!parsed) return
    setPendingPreset('custom')
    setAwaitingSecondClick(false)
    setPendingStart(parsed)
    if (parsed > pendingEnd) setPendingEnd(parsed)
    setCursor(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
  }

  function handleEndInput(value: string) {
    const parsed = fromDateInputValue(value)
    if (!parsed) return
    setPendingPreset('custom')
    setAwaitingSecondClick(false)
    setPendingEnd(parsed)
    if (parsed < pendingStart) setPendingStart(parsed)
  }

  function apply() {
    onApply(pendingPreset, pendingStart, pendingEnd)
    setOpen(false)
  }

  const leftMonth = cursor
  const rightMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)

  return (
    <div className="range-picker" ref={containerRef}>
      <button
        type="button"
        className="range-picker-trigger"
        onClick={() => (open ? setOpen(false) : openPanel())}
      >
        <span className="range-picker-trigger-label">
          {preset === 'custom' ? formatRangeLabel(start, end) : RANGE_PRESET_LABELS[preset]}
        </span>
        <span className="range-picker-trigger-chevron" aria-hidden="true">
          ⌄
        </span>
      </button>

      {open && (
        <div className="range-picker-panel">
          <div className="range-picker-presets">
            {RANGE_PRESET_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                className={`range-picker-preset ${pendingPreset === id ? 'is-active' : ''}`}
                onClick={() => selectPreset(id)}
              >
                {RANGE_PRESET_LABELS[id]}
              </button>
            ))}
          </div>

          <div className="range-picker-calendar">
            <div className="range-picker-inputs">
              <label className="range-picker-input-field">
                <span>Start date</span>
                <input
                  type="date"
                  value={toDateInputValue(pendingStart)}
                  onChange={(e) => handleStartInput(e.target.value)}
                />
              </label>
              <label className="range-picker-input-field">
                <span>End date</span>
                <input
                  type="date"
                  value={toDateInputValue(pendingEnd)}
                  onChange={(e) => handleEndInput(e.target.value)}
                />
              </label>
            </div>

            <div className="range-picker-months">
              <CalendarMonth
                year={leftMonth.getFullYear()}
                month={leftMonth.getMonth()}
                pendingStart={pendingStart}
                pendingEnd={pendingEnd}
                onDayClick={handleDayClick}
                onPrev={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                showPrev
              />
              <CalendarMonth
                year={rightMonth.getFullYear()}
                month={rightMonth.getMonth()}
                pendingStart={pendingStart}
                pendingEnd={pendingEnd}
                onDayClick={handleDayClick}
                onNext={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                showNext
              />
            </div>

            <div className="range-picker-actions">
              <button type="button" className="range-picker-cancel" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button type="button" className="range-picker-apply" onClick={apply}>
                Apply Dates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CalendarMonth({
  year,
  month,
  pendingStart,
  pendingEnd,
  onDayClick,
  onPrev,
  onNext,
  showPrev,
  showNext,
}: {
  year: number
  month: number
  pendingStart: Date
  pendingEnd: Date
  onDayClick: (day: Date) => void
  onPrev?: () => void
  onNext?: () => void
  showPrev?: boolean
  showNext?: boolean
}) {
  const weeks = useMemo(() => buildMonthGrid(year, month), [year, month])
  const label = new Date(year, month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="range-picker-month">
      <div className="range-picker-month-header">
        {showPrev ? (
          <button
            type="button"
            className="range-picker-nav"
            onClick={onPrev}
            aria-label="Previous month"
          >
            ‹
          </button>
        ) : (
          <span className="range-picker-nav-spacer" />
        )}
        <span className="range-picker-month-label">{label}</span>
        {showNext ? (
          <button
            type="button"
            className="range-picker-nav"
            onClick={onNext}
            aria-label="Next month"
          >
            ›
          </button>
        ) : (
          <span className="range-picker-nav-spacer" />
        )}
      </div>

      <div className="range-picker-weekdays">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      {weeks.map((week, wi) => (
        <div className="range-picker-week" key={wi}>
          {week.map((day, di) => {
            if (!day) return <span className="range-picker-day is-empty" key={di} />
            const isStart = isSameDay(day, pendingStart)
            const isEnd = isSameDay(day, pendingEnd)
            const isInRange = day > pendingStart && day < pendingEnd
            const classes = [
              'range-picker-day',
              isStart || isEnd ? 'is-endpoint' : '',
              isInRange ? 'is-in-range' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <button type="button" key={di} className={classes} onClick={() => onDayClick(day)}>
                {day.getDate()}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
