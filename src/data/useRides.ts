import { useEffect, useState } from 'react'
import { loadRides } from './loadRides'
import type { Ride } from '../types/ride'

interface RidesState {
  rides: Ride[]
  isSample: boolean
  loading: boolean
}

export function useRides(): RidesState {
  const [state, setState] = useState<RidesState>({
    rides: [],
    isSample: false,
    loading: true,
  })

  useEffect(() => {
    let cancelled = false
    loadRides().then((result) => {
      if (!cancelled) setState({ ...result, loading: false })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
