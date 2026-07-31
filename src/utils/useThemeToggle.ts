import { useEffect, useState } from 'react'
import { useIsDarkMode } from './useIsDarkMode'

const STORAGE_KEY = 'theme-preference'

type ThemePreference = 'light' | 'dark' | null

function readStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' ? stored : null
}

// `null` means "no explicit choice yet" — leaves the `data-theme` attribute
// untouched so the app keeps following the OS's prefers-color-scheme live,
// exactly like before this toggle existed. Only once the user actually
// clicks the toggle do we pin an explicit theme and remember it.
export function useThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>(readStoredPreference)
  const isDark = useIsDarkMode()

  useEffect(() => {
    if (preference) {
      document.documentElement.setAttribute('data-theme', preference)
      localStorage.setItem(STORAGE_KEY, preference)
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [preference])

  function toggle() {
    setPreference(isDark ? 'light' : 'dark')
  }

  return { isDark, toggle }
}
