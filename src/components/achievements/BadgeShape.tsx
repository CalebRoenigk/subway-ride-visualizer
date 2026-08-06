import { useId, type ReactNode } from 'react'
import type { BadgeStatus, Rarity } from '../../types/achievement'
import './badge-shape.css'

// Rounded regular polygons, flat-top orientation, all inscribed in the same
// 56x56 box (center 28,28, circumradius 25) with a fixed ~4.5px corner
// radius. Sides escalate with rarity — common starts at a square and every
// tier adds a point, topping out at an octagon for legendary — so a
// badge's prestige reads from its silhouette alone, before color ever
// factors in (locked badges keep their shape, just muted).
const SHAPE_PATHS: Record<Rarity, string> = {
  common:
    'M10.32 14.82 L10.32 41.18 Q10.32 45.68 14.82 45.68 L41.18 45.68 Q45.68 45.68 45.68 41.18 L45.68 14.82 Q45.68 10.32 41.18 10.32 L14.82 10.32 Q10.32 10.32 10.32 14.82 Z',
  uncommon:
    'M11.91 12.05 L5.61 31.45 Q4.22 35.73 7.86 38.37 L24.36 50.35 Q28.0 53.0 31.64 50.35 L48.14 38.37 Q51.78 35.73 50.39 31.45 L44.09 12.05 Q42.69 7.77 38.19 7.77 L17.81 7.77 Q13.31 7.77 11.91 12.05 Z',
  rare:
    'M13.25 10.25 L5.25 24.1 Q3.0 28.0 5.25 31.9 L13.25 45.75 Q15.5 49.65 20.0 49.65 L36.0 49.65 Q40.5 49.65 42.75 45.75 L50.75 31.9 Q53.0 28.0 50.75 24.1 L42.75 10.25 Q40.5 6.35 36.0 6.35 L20.0 6.35 Q15.5 6.35 13.25 10.25 Z',
  epic:
    'M14.35 8.99 L6.43 18.92 Q3.63 22.44 4.63 26.82 L7.45 39.2 Q8.45 43.59 12.51 45.54 L23.95 51.05 Q28.0 53.0 32.05 51.05 L43.49 45.54 Q47.55 43.59 48.55 39.2 L51.37 26.82 Q52.37 22.44 49.57 18.92 L41.65 8.99 Q38.85 5.48 34.35 5.48 L21.65 5.48 Q17.15 5.48 14.35 8.99 Z',
  legendary:
    'M15.25 8.08 L8.08 15.25 Q4.9 18.43 4.9 22.93 L4.9 33.07 Q4.9 37.57 8.08 40.75 L15.25 47.92 Q18.43 51.1 22.93 51.1 L33.07 51.1 Q37.57 51.1 40.75 47.92 L47.92 40.75 Q51.1 37.57 51.1 33.07 L51.1 22.93 Q51.1 18.43 47.92 15.25 L40.75 8.08 Q37.57 4.9 33.07 4.9 L22.93 4.9 Q18.43 4.9 15.25 8.08 Z',
}

const STROKE_WIDTH: Record<Rarity, number> = {
  common: 1.5,
  uncommon: 2,
  rare: 2.5,
  epic: 3,
  legendary: 3.5,
}

const ACCENTED: Record<Rarity, boolean> = {
  common: false,
  uncommon: false,
  rare: true,
  epic: true,
  legendary: true,
}

// Icons are authored on a 24x24 grid; this centers that grid inside the
// badge's 56x56 canvas at a size that fills it without touching the edges.
const ICON_TRANSFORM = 'translate(14.2 14.2) scale(1.15)'

interface BadgeShapeProps {
  status: BadgeStatus
  rarity: Rarity
  fillPct?: number
  size?: number
  icon?: ReactNode
}

export function BadgeShape({ status, rarity, fillPct = 0, size = 56, icon }: BadgeShapeProps) {
  const clipId = useId()
  const path = SHAPE_PATHS[rarity]
  const strokeWidth = STROKE_WIDTH[rarity]
  const strokeColor =
    status === 'locked' ? 'var(--border-strong)' : ACCENTED[rarity] ? 'var(--achievement-accent)' : 'var(--text-primary)'
  const baseFill = status === 'earned' ? 'var(--text-primary)' : 'var(--surface-1)'
  const clampedPct = Math.min(Math.max(fillPct, 0), 100)
  const fillHeight = 56 * (clampedPct / 100)
  const fillY = 56 - fillHeight
  const glow = status === 'earned' && (rarity === 'epic' || rarity === 'legendary')

  const iconColor = status === 'locked' ? 'var(--text-muted)' : status === 'earned' ? 'var(--surface-1)' : strokeColor

  return (
    <span
      className={`badge-shape${glow ? ' badge-shape--glow' : ''}${rarity === 'legendary' && status === 'earned' ? ' badge-shape--legendary-earned' : ''}`}
    >
      <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden="true">
        <path d={path} fill={baseFill} stroke={strokeColor} strokeWidth={strokeWidth} />
        {status === 'in-progress' && (
          <>
            <clipPath id={clipId}>
              <path d={path} />
            </clipPath>
            <rect
              className="badge-shape-fill"
              x={0}
              y={fillY}
              width={56}
              height={fillHeight}
              fill="var(--text-primary)"
              clipPath={`url(#${clipId})`}
            />
            <path d={path} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
          </>
        )}
        {icon && (
          <>
            {status === 'in-progress' && (
              <g
                transform={ICON_TRANSFORM}
                fill="none"
                stroke="var(--surface-1)"
                strokeWidth={4.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {icon}
              </g>
            )}
            <g
              transform={ICON_TRANSFORM}
              fill="none"
              stroke={iconColor}
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {icon}
            </g>
          </>
        )}
      </svg>
    </span>
  )
}
