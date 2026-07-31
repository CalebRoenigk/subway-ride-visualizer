export interface FleetInfo {
  manufacturer: string
  type: string
  variant: string
}

interface RawFleetRecord {
  'fleet-info': FleetInfo
  'yard-info': { assigned: string; 'last-known': string }
  'unit-numbers': number[]
  status: string
  lines: (string | number)[]
}

export interface FleetRecord {
  fleetInfo: FleetInfo
  yardAssigned: string
  yardLastKnown: string
  unitNumbers: string[]
  status: string
  lines: string[]
}

export async function loadFleet(): Promise<FleetRecord[]> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/fleet-export.json`)
    if (!res.ok) return []
    const raw: RawFleetRecord[] = await res.json()
    return raw.map((r) => ({
      fleetInfo: r['fleet-info'],
      yardAssigned: r['yard-info']?.assigned ?? '',
      yardLastKnown: r['yard-info']?.['last-known'] ?? '',
      unitNumbers: (r['unit-numbers'] ?? []).map(String),
      status: r.status,
      lines: (r.lines ?? []).map(String),
    }))
  } catch {
    return []
  }
}

export function findConsist(
  fleet: FleetRecord[],
  carNumber: string,
): FleetRecord | undefined {
  return fleet.find((r) => r.unitNumbers.includes(carNumber))
}

// Car number -> real fleet car type (e.g. "R211A"), the authoritative
// source over whatever type an Airtable row happened to be logged with.
export function buildCarTypeIndex(fleet: FleetRecord[]): Map<string, string> {
  const index = new Map<string, string>()
  for (const record of fleet) {
    for (const unit of record.unitNumbers) {
      index.set(unit, record.fleetInfo.type)
    }
  }
  return index
}
