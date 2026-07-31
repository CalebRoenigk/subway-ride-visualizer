import { useEffect, useState, type RefObject } from 'react'

interface Size {
  width: number
  height: number
}

export function useElementSize(
  ref: RefObject<HTMLElement | null>,
  fallback: Size,
): Size {
  const [size, setSize] = useState(fallback)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })
    observer.observe(el)
    const rect = el.getBoundingClientRect()
    setSize({
      width: rect.width || fallback.width,
      height: rect.height || fallback.height,
    })

    return () => observer.disconnect()
  }, [ref, fallback.width, fallback.height])

  return size
}
