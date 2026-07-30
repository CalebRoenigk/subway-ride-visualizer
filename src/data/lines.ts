export interface LineMeta {
  id: string
  color: string
  division: string
}

// Official MTA route colors. These are fixed brand colors riders already
// recognize, so we keep them as-is rather than remapping to a generic
// categorical palette — identity is reinforced by the bullet label (never
// color alone), per each line's contrast-computed text color.
export const LINES: LineMeta[] = [
  { id: '1', color: '#EE352E', division: 'IRT Broadway–7th Ave' },
  { id: '2', color: '#EE352E', division: 'IRT Broadway–7th Ave' },
  { id: '3', color: '#EE352E', division: 'IRT Broadway–7th Ave' },
  { id: '4', color: '#00933C', division: 'IRT Lexington Ave' },
  { id: '5', color: '#00933C', division: 'IRT Lexington Ave' },
  { id: '6', color: '#00933C', division: 'IRT Lexington Ave' },
  { id: '7', color: '#B933AD', division: 'IRT Flushing' },
  { id: 'A', color: '#0039A6', division: 'IND 8th Ave' },
  { id: 'C', color: '#0039A6', division: 'IND 8th Ave' },
  { id: 'E', color: '#0039A6', division: 'IND 8th Ave' },
  { id: 'B', color: '#FF6319', division: 'IND 6th Ave' },
  { id: 'D', color: '#FF6319', division: 'IND 6th Ave' },
  { id: 'F', color: '#FF6319', division: 'IND 6th Ave' },
  { id: 'M', color: '#FF6319', division: 'IND 6th Ave' },
  { id: 'G', color: '#6CBE45', division: 'IND Crosstown' },
  { id: 'J', color: '#996633', division: 'BMT Nassau St' },
  { id: 'Z', color: '#996633', division: 'BMT Nassau St' },
  { id: 'L', color: '#A7A9AC', division: 'BMT Canarsie' },
  { id: 'N', color: '#FCCC0A', division: 'BMT Broadway' },
  { id: 'Q', color: '#FCCC0A', division: 'BMT Broadway' },
  { id: 'R', color: '#FCCC0A', division: 'BMT Broadway' },
  { id: 'W', color: '#FCCC0A', division: 'BMT Broadway' },
  { id: 'S', color: '#808183', division: 'Shuttle' },
]

const LINES_BY_ID = new Map(LINES.map((line) => [line.id, line]))

export function getLineMeta(id: string): LineMeta {
  return (
    LINES_BY_ID.get(id) ?? {
      id,
      color: '#6b6b6b',
      division: 'Unknown',
    }
  )
}

// Pick whichever of black/white text has the higher WCAG contrast ratio
// against the given background — not a guessed luminance cutoff.
export function getContrastText(hex: string): '#0b0b0b' | '#ffffff' {
  const c = hex.replace('#', '')
  const r = parseInt(c.slice(0, 2), 16) / 255
  const g = parseInt(c.slice(2, 4), 16) / 255
  const b = parseInt(c.slice(4, 6), 16) / 255
  const toLinear = (v: number) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  const contrastWithBlack = (luminance + 0.05) / 0.05
  const contrastWithWhite = 1.05 / (luminance + 0.05)
  return contrastWithBlack >= contrastWithWhite ? '#0b0b0b' : '#ffffff'
}
