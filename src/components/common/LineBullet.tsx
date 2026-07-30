import { getContrastText, getLineMeta } from '../../data/lines'
import './line-bullet.css'

interface LineBulletProps {
  line: string
  size?: 'sm' | 'md' | 'lg'
}

export function LineBullet({ line, size = 'md' }: LineBulletProps) {
  const meta = getLineMeta(line)
  return (
    <span
      className={`line-bullet line-bullet--${size}`}
      style={{ background: meta.color, color: getContrastText(meta.color) }}
      title={`${line} line`}
    >
      {line}
    </span>
  )
}
