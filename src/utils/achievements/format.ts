import type { BadgeState } from '../../types/achievement'

export function formatBadgeFraction(state: BadgeState): string {
  const { def, status, progress } = state

  if (def.kind === 'predicate') {
    return status === 'earned' ? '✓' : (def.hint ?? '—')
  }

  const { current, target } = progress
  switch (def.category) {
    case 'same-car':
      return status === 'earned' ? `${target}×` : `${Math.floor(current)}/${target}`
    case 'total-rides':
      return status === 'earned'
        ? target.toLocaleString()
        : `${Math.floor(current).toLocaleString()}/${target.toLocaleString()}`
    case 'fleet-pct':
      return status === 'earned' ? `${target}%` : `${current.toFixed(1)}/${target}%`
    case 'pattern':
      return status === 'earned' ? '✓' : `${Math.floor(current)}/${target}`
    default:
      return status === 'earned' ? `${target}` : `${Math.floor(current)}/${target}`
  }
}
