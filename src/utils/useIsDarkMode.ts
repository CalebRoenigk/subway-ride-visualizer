import { useEffect, useState } from 'react'

function computeIsDark(): boolean {
  const explicit = document.documentElement.getAttribute('data-theme')
  if (explicit === 'dark') return true
  if (explicit === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Mirrors the light/dark resolution in tokens.css (data-theme override,
// falling back to the OS preference) so JS-computed colors — like the
// heatmap's ride-count ramp — stay in sync with the CSS custom properties.
export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(computeIsDark)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setIsDark(computeIsDark())

    mediaQuery.addEventListener('change', update)
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => {
      mediaQuery.removeEventListener('change', update)
      observer.disconnect()
    }
  }, [])

  return isDark
}
