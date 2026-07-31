import { useEffect, useState } from 'react'
import { loadFleet, type FleetRecord } from './loadFleet'

interface FleetState {
  fleet: FleetRecord[]
  loading: boolean
}

export function useFleet(): FleetState {
  const [state, setState] = useState<FleetState>({ fleet: [], loading: true })

  useEffect(() => {
    let cancelled = false
    loadFleet().then((fleet) => {
      if (!cancelled) setState({ fleet, loading: false })
    })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
