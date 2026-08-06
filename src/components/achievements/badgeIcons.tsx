import type { ReactNode } from 'react'

// Every icon is drawn as bare shape primitives in a 24x24 grid, with no
// stroke/fill/width of its own — BadgeShape supplies those (and renders
// each icon twice: a wide light "halo" pass, then the crisp real pass),
// so a single definition here works against any status/rarity combo.
//
// Tiered families share one icon across all their tiers (same-car,
// total-rides, streak, etc. — keyed by familyId); standalone one-off
// badges (funny numbers, palindrome, early bird, ...) get their own,
// also keyed by familyId since predicate() sets familyId = id for those.
const BADGE_ICONS: Record<string, () => ReactNode> = {
  // ---- tiered families ----
  'same-car': () => (
    <>
      <path d="M4 12a8 8 0 0 1 14-5.3" />
      <path d="M18 3v5h-5" />
      <path d="M20 12a8 8 0 0 1-14 5.3" />
      <path d="M6 21v-5h5" />
    </>
  ),
  'total-rides': () => (
    <>
      <rect x="4" y="5" width="16" height="11" rx="3" />
      <line x1="4" y1="10" x2="20" y2="10" />
      <circle cx="8" cy="19" r="1.4" />
      <circle cx="16" cy="19" r="1.4" />
    </>
  ),
  'fleet-pct': () => (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.3" />
      <rect x="14" y="3" width="7" height="7" rx="1.3" />
      <rect x="3" y="14" width="7" height="7" rx="1.3" />
      <rect x="14" y="14" width="7" height="7" rx="1.3" />
    </>
  ),
  trainset: () => (
    <>
      <rect x="1" y="8" width="6" height="8" rx="1.3" />
      <rect x="9" y="8" width="6" height="8" rx="1.3" />
      <rect x="17" y="8" width="6" height="8" rx="1.3" />
      <line x1="7" y1="12" x2="9" y2="12" />
      <line x1="15" y1="12" x2="17" y2="12" />
    </>
  ),
  line: () => (
    <>
      <path d="M3 18c4-7 8 4 12-3s3-7 6-10" />
      <circle cx="20" cy="6" r="1.6" />
    </>
  ),
  'car-type': () => (
    <>
      <path d="M3 11.5 11.5 3H19a2 2 0 0 1 2 2v7.5l-8.5 8.5a2 2 0 0 1-2.8 0l-6.2-6.2a2 2 0 0 1 0-2.8z" />
      <circle cx="15" cy="9" r="1.4" />
    </>
  ),
  'repeated-digit': () => (
    <>
      <rect x="4" y="4" width="12" height="12" rx="2" />
      <rect x="9" y="9" width="12" height="12" rx="2" />
    </>
  ),
  streak: () => (
    <path d="M12 2.5c1.2 3.5-2.8 4.8-2.8 8.5a2.8 2.8 0 0 0 5.6 0c0-1-.6-1.7-.6-1.7 1 1.7 2.8 2.8 2.8 5.4a5 5 0 0 1-10 0c0-5.2 3.2-7.6 5-12.2z" />
  ),
  'weekend-rides': () => (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <rect x="13.5" y="13" width="4" height="4" rx="0.8" />
    </>
  ),
  'daily-lines': () => (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13 13l-4.5 2.5L11 11z" />
    </>
  ),

  // ---- standalone number patterns ----
  'pattern-palindrome': () => (
    <>
      <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="2.5 2.5" />
      <path d="M8.5 8h-2.5l2 4-2 4h2.5" />
      <path d="M15.5 8h2.5l-2 4 2 4h-2.5" />
    </>
  ),
  'pattern-repeating-pair': () => (
    <>
      <circle cx="12" cy="12" r="1.6" />
      <path d="M9 9a4.2 4.2 0 0 0 0 6" />
      <path d="M15 9a4.2 4.2 0 0 1 0 6" />
      <path d="M6 6a8.5 8.5 0 0 0 0 12" />
      <path d="M18 6a8.5 8.5 0 0 1 0 12" />
    </>
  ),
  'pattern-round-number': () => (
    <>
      <path d="M4.5 12a7.5 7.5 0 1 0 2.6-5.7" />
      <path d="M4 3.3v3.6h3.6" />
    </>
  ),
  'pattern-ascending': () => (
    <>
      <path d="M3 20h4v-4H3z" />
      <path d="M10 20h4v-9h-4z" />
      <path d="M17 20h4V6h-4z" />
    </>
  ),
  'pattern-descending': () => (
    <>
      <path d="M3 20h4V6H3z" />
      <path d="M10 20h4v-9h-4z" />
      <path d="M17 20h4v-4h-4z" />
    </>
  ),

  // ---- funny numbers (each fully unique) ----
  'funny-6900': () => (
    <>
      <path d="M7 21V10.5l3-7.5 1.8.9v6.6h5.7a1.8 1.8 0 0 1 1.76 2.15l-1.1 5.5A1.8 1.8 0 0 1 16.4 21z" />
      <path d="M3.2 10.5h3.8V21H3.2z" />
    </>
  ),
  'funny-4200': () => <path d="M7 17.5a3.7 3.7 0 0 1-.9-7.3 4.6 4.6 0 0 1 8.8-1.8A4.1 4.1 0 0 1 16.5 17.5z" />,
  'funny-6969': () => (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="8.7" cy="10" r="1" />
      <circle cx="15.3" cy="10" r="1" />
      <path d="M7.8 15c1.6 1.4 6.8 1.4 8.4 0" />
    </>
  ),
  'funny-1337': () => (
    <>
      <path d="M8.5 6 3.5 12l5 6" />
      <path d="M15.5 6l5 6-5 6" />
    </>
  ),
  'funny-1984': () => (
    <>
      <path d="M2.2 12S6 5.5 12 5.5 21.8 12 21.8 12 18 18.5 12 18.5 2.2 12 2.2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'funny-3141': () => (
    <>
      <line x1="4.5" y1="6.5" x2="19.5" y2="6.5" />
      <line x1="8" y1="6.5" x2="7" y2="20" />
      <path d="M16 6.5v10a3 3 0 0 0 3 3" />
    </>
  ),
  'funny-1234': () => (
    <>
      <circle cx="5" cy="18" r="1.8" />
      <circle cx="12" cy="13" r="2.3" />
      <circle cx="19" cy="6.5" r="2.8" />
    </>
  ),
  'funny-4321': () => (
    <>
      <path d="M12 2.5c3 2.2 4.8 6 4.8 9.8 0 2-.9 3.8-1.9 4.9l-2.9 2.9-2.9-2.9c-1-1.1-1.9-2.9-1.9-4.9 0-3.8 1.8-7.6 4.8-9.8z" />
      <circle cx="12" cy="10.5" r="1.4" />
      <path d="M9 17l-2.5 3.5" />
      <path d="M15 17l2.5 3.5" />
    </>
  ),
  'funny-1235': () => (
    <>
      <path d="M12 3.2a8.8 8.8 0 1 0 8.8 8.8" />
      <path d="M12 3.2a5.6 5.6 0 1 1-5.6 5.6" />
      <path d="M6.4 8.8a2.4 2.4 0 1 0 2.4 2.4" />
    </>
  ),

  // ---- time of day / sequence ----
  'time-early-bird': () => (
    <>
      <circle cx="12" cy="16" r="4" />
      <line x1="12" y1="2.5" x2="12" y2="7" />
      <line x1="4.5" y1="9.5" x2="7.2" y2="11.2" />
      <line x1="19.5" y1="9.5" x2="16.8" y2="11.2" />
      <line x1="2" y1="21" x2="22" y2="21" />
    </>
  ),
  'time-night-owl': () => <path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.8 6.8 0 0 0 10.2 10.2z" />,
  'sequence-back-to-back': () => (
    <>
      <rect x="2" y="8" width="9" height="8" rx="4" />
      <rect x="13" y="8" width="9" height="8" rx="4" />
      <line x1="9.5" y1="12" x2="14.5" y2="12" />
    </>
  ),

  default: () => <path d="M12 3.5l2.4 5 5.5.6-4 3.8 1 5.5-4.9-2.7-4.9 2.7 1-5.5-4-3.8 5.5-.6z" />,
}

export function getBadgeIcon(familyId: string): ReactNode {
  const factory = BADGE_ICONS[familyId] ?? BADGE_ICONS.default
  return factory()
}
