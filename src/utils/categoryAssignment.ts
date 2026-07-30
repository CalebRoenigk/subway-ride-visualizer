import type { Ride } from '../types/ride'
import { LINES, getLineMeta } from '../data/lines'

export interface CategoryAssignment {
  order: string[]
  colorOf: (id: string) => string
  remap: (rawCategory: string) => string
}

// The design system's validated 8-hue categorical theme (fixed order —
// never cycled). Used for Car Type, which has no inherent brand color
// unlike subway lines. Adjacent pairs clear the CVD/contrast gates in both
// modes per the palette's own validation.
const CATEGORICAL_LIGHT = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
]

const CATEGORICAL_DARK = [
  '#3987e5',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
  '#e66767',
]

const OTHER_COLOR = '#898781'

export function buildLineAssignment(rides: Ride[]): CategoryAssignment {
  const present = new Set(rides.map((r) => r.line || 'Unknown'))
  const order = LINES.filter((l) => present.has(l.id)).map((l) => l.id)
  if (present.has('Unknown')) order.push('Unknown')

  return {
    order,
    colorOf: (id) => getLineMeta(id).color,
    remap: (raw) => raw,
  }
}

// Car types have no fixed real-world color, and a fleet can have well over
// 8 distinct types — past the categorical theme's cap, so anything beyond
// the most-ridden 7 folds into a single "Other" bucket (never a 9th
// generated hue) per the theme's own rule.
export function buildTypeAssignment(
  rides: Ride[],
  isDark: boolean,
): CategoryAssignment {
  const theme = isDark ? CATEGORICAL_DARK : CATEGORICAL_LIGHT

  const counts = new Map<string, number>()
  for (const ride of rides) {
    const raw = ride.carType || 'Unknown'
    counts.set(raw, (counts.get(raw) ?? 0) + 1)
  }

  const sortedIds = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)

  const keepCount =
    sortedIds.length > theme.length ? theme.length - 1 : sortedIds.length
  const kept = new Set(sortedIds.slice(0, keepCount))
  const hasOther = sortedIds.length > keepCount

  const order = sortedIds.filter((id) => kept.has(id))
  if (hasOther) order.push('Other')

  const colorMap = new Map<string, string>()
  order.forEach((id, i) => {
    colorMap.set(id, id === 'Other' ? OTHER_COLOR : theme[i])
  })

  return {
    order,
    colorOf: (id) => colorMap.get(id) ?? OTHER_COLOR,
    remap: (raw) => (kept.has(raw) ? raw : 'Other'),
  }
}
