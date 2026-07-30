// Sequential magnitude scale: single-hue blue, light -> dark, for ride count
// per car. Colorblind-safe (no hue change carries the meaning, only
// lightness/saturation) — replaces an earlier green-to-red-orange version.
// Stops pulled from the design system's sequential blue ramp; light and dark
// use different sub-ranges of it so both ends stay legible against their
// respective chart surface (a fixed range can't satisfy both: the step that
// reads as "dark ink on a light surface" nearly disappears on a dark one).
type RGB = [number, number, number]

const LIGHT_RAMP: [RGB, RGB] = [
  [109, 167, 236], // #6da7ec - ramp step 300
  [13, 54, 107], // #0d366b - ramp step 700
]

const DARK_RAMP: [RGB, RGB] = [
  [28, 92, 171], // #1c5cab - ramp step 550
  [158, 197, 244], // #9ec5f4 - ramp step 200
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function rgbToHex([r, g, b]: RGB): string {
  const toHex = (v: number) => Math.round(v).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function getRideCountColor(
  count: number,
  max: number,
  isDark: boolean,
): string {
  const [lo, hi] = isDark ? DARK_RAMP : LIGHT_RAMP
  if (max <= 1) return rgbToHex(lo)

  const t = Math.min(Math.max((count - 1) / (max - 1), 0), 1)
  const rgb: RGB = [
    lerp(lo[0], hi[0], t),
    lerp(lo[1], hi[1], t),
    lerp(lo[2], hi[2], t),
  ]
  return rgbToHex(rgb)
}

export function getRideCountScaleStops(isDark: boolean): [string, string] {
  const [lo, hi] = isDark ? DARK_RAMP : LIGHT_RAMP
  return [rgbToHex(lo), rgbToHex(hi)]
}
