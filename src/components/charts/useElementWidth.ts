import { useEffect, useState, type RefObject } from 'react'

export function useElementWidth(
  ref: RefObject<HTMLElement | null>,
  fallback: number,
): number {
  const [width, setWidth] = useState(fallback)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setWidth(entry.contentRect.width)
    })
    observer.observe(el)
    setWidth(el.getBoundingClientRect().width || fallback)

    return () => observer.disconnect()
  }, [ref, fallback])

  return width
}
