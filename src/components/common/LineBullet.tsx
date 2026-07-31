import { getContrastText, getLineMeta } from '../../data/lines'
import './line-bullet.css'

interface LineBulletProps {
  line: string
  size?: 'sm' | 'md' | 'lg'
  dimmed?: boolean
}

export function LineBullet({ line, size = 'md', dimmed = false }: LineBulletProps) {
  const meta = getLineMeta(line)
  const background = dimmed ? 'var(--gridline)' : meta.color
  const color = dimmed ? 'var(--text-muted)' : getContrastText(meta.color)
  return (
    <span
      className={`line-bullet line-bullet--${size}`}
      style={{ background, color }}
      title={`${line} line`}
    >
      {line}
    </span>
  )
}
