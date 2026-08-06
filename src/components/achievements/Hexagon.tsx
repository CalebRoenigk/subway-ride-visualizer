import { useId } from 'react'
import type { BadgeStatus } from '../../types/achievement'
import './hexagon.css'

// Regular pointy-top hexagon inscribed in a 56x56 box, corners softened
// with quadratic curves (each vertex cut 22% along its adjacent edges).
const HEX_PATH =
  'M32.76 5.75 L44.89 12.75 Q49.65 15.5 49.65 21 L49.65 35 ' +
  'Q49.65 40.5 44.89 43.25 L32.76 50.25 Q28 53 23.24 50.25 L11.11 43.25 ' +
  'Q6.35 40.5 6.35 35 L6.35 21 Q6.35 15.5 11.11 12.75 L23.24 5.75 Q28 3 32.76 5.75 Z'

interface HexagonProps {
  status: BadgeStatus
  fillPct?: number
  size?: number
}

export function Hexagon({ status, fillPct = 0, size = 56 }: HexagonProps) {
  const clipId = useId()
  const strokeColor = status === 'locked' ? 'var(--border-strong)' : 'var(--text-primary)'
  const baseFill = status === 'earned' ? 'var(--text-primary)' : 'var(--surface-1)'
  const clampedPct = Math.min(Math.max(fillPct, 0), 100)
  const fillHeight = 56 * (clampedPct / 100)
  const fillY = 56 - fillHeight

  return (
    <svg className="ach-hex" viewBox="0 0 56 56" width={size} height={size} aria-hidden="true">
      <path d={HEX_PATH} fill={baseFill} stroke={strokeColor} strokeWidth={2} />
      {status === 'in-progress' && (
        <>
          <clipPath id={clipId}>
            <path d={HEX_PATH} />
          </clipPath>
          <rect x={0} y={fillY} width={56} height={fillHeight} fill="var(--text-primary)" clipPath={`url(#${clipId})`} />
          <path d={HEX_PATH} fill="none" stroke="var(--text-primary)" strokeWidth={2} />
        </>
      )}
      {status === 'earned' && (
        <text x={28} y={34.5} textAnchor="middle" fontSize={20} fontWeight={900} fill="var(--surface-1)">
          ✓
        </text>
      )}
    </svg>
  )
}
