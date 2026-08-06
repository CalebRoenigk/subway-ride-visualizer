import { useEffect, useState } from 'react'

const STORAGE_KEY = 'achievements-last-visited'

// Returns the timestamp of the previous visit (null if this is the first
// ever visit), then immediately overwrites storage with "now" so the next
// visit's diff starts fresh. The returned value stays stable for the life
// of the component, so "new since last visit" comparisons made against it
// hold for the whole time the page is open.
export function useAchievementsVisit(): Date | null {
  const [lastVisited] = useState<Date | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Date(raw) : null
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString())
  }, [])

  return lastVisited
}
