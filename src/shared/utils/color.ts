function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const normalized = hex.replace('#', '')
  const r = parseInt(normalized.substring(0, 2), 16) / 255
  const g = parseInt(normalized.substring(2, 4), 16) / 255
  const b = parseInt(normalized.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return { h: 0, s: 0, l: l * 100 }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0)
      break
    case g:
      h = (b - r) / d + 2
      break
    default:
      h = (r - g) / d + 4
  }

  return { h: h * 60, s: s * 100, l: l * 100 }
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100
  const lNorm = l / 100
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let [r, g, b] = [0, 0, 0]
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Flips a color's lightness (keeping hue/saturation) so admin-picked text colors tuned
// for a light background stay readable once that background goes dark, and vice versa.
// Muted/soft roles arrive here as `rgba(r, g, b, a)` (see hexToRgba) rather than hex, so
// both formats must be handled or dark-mode inversion silently no-ops for those roles.
export function invertLightnessForDarkMode(color: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    const { h, s, l } = hexToHsl(color)
    return hslToHex(h, s, 100 - l)
  }

  const rgbaMatch = color.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/)
  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch
    const hex = `#${[r, g, b].map((v) => Number(v).toString(16).padStart(2, '0')).join('')}`
    const { h, s, l } = hexToHsl(hex)
    const inverted = hslToHex(h, s, 100 - l)
    return hexToRgba(inverted, Number(a))
  }

  return color
}

// Muted/soft text-element roles are expressed as the theme's base color at reduced opacity
// rather than a separate stored hex, so they track the global color live.
export function hexToRgba(hex: string, alpha: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
