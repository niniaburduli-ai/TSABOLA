export type WineDiscount = { percent: number }

function parsePriceNumber(value: string): number | null {
  const match = value.replace(',', '.').match(/[\d.]+/)
  if (!match) return null
  const num = parseFloat(match[0])
  return Number.isFinite(num) ? num : null
}

export function getWineDiscount(price: string, discountPrice?: string): WineDiscount | null {
  if (!discountPrice) return null
  const original = parsePriceNumber(price)
  const discounted = parsePriceNumber(discountPrice)
  if (original === null || discounted === null || original <= 0 || discounted >= original) return null
  return { percent: Math.round(((original - discounted) / original) * 100) }
}
