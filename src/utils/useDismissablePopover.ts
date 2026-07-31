import { useEffect, useRef, useState, type RefObject } from 'react'

interface DismissablePopover<T extends HTMLElement> {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  ref: RefObject<T | null>
}

// Shared open/close mechanics for any custom dropdown-style popover: closes
// on an outside click or Escape, otherwise stays open until the consumer
// explicitly closes it (so a multi-step panel like a date-range picker can
// keep itself open across preset clicks and only close on Apply/Cancel).
export function useDismissablePopover<
  T extends HTMLElement = HTMLDivElement,
>(): DismissablePopover<T> {
  const [open, setOpen] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
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

  return { open, setOpen, toggle: () => setOpen((o) => !o), ref }
}
