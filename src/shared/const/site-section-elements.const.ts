import type { SectionKey, SectionStyle, TextElementStyle } from '@/features/tsabola/types'

const CREAM = '#faf8f5'
const CREAM_MUTED = '#c9c6c0'
const CREAM_SOFT = '#bdbab4'
const CHARCOAL = '#1a1a1a'
const CHARCOAL_MUTED = '#4a4a4a'
const WINE = '#722F37'
const SANS = '--font-sans'
const HEADING = '--font-space-grotesk'
const DISPLAY = '--font-display'

export type SectionElementDef = { key: string; label: string; default: TextElementStyle }

// Single source of truth for both the admin editor's field list and DEFAULT_THEME.sections —
// each element's default reproduces its original hardcoded look (size: 'md' = multiplier 1).
export const SITE_SECTION_ELEMENTS: Record<SectionKey, SectionElementDef[]> = {
  hero: [
    { key: 'siteName', label: 'საიტის სახელი', default: { color: CREAM, font: HEADING, size: 'md' } },
    { key: 'slogan', label: 'სლოგანი', default: { color: CREAM_MUTED, font: SANS, size: 'md' } },
    { key: 'headline', label: 'სათაური', default: { color: CREAM, font: HEADING, size: 'md' } },
    { key: 'subline', label: 'ქვესათაური', default: { color: CREAM_SOFT, font: SANS, size: 'md' } },
    { key: 'cta', label: 'ღილაკი', default: { color: CREAM, font: HEADING, size: 'md' } },
  ],
  wines: [
    { key: 'eyebrow', label: 'ზედწარწერა', default: { color: WINE, font: SANS, size: 'md' } },
    { key: 'heading', label: 'სათაური', default: { color: CHARCOAL, font: DISPLAY, size: 'md' } },
  ],
  news: [
    { key: 'eyebrow', label: 'ზედწარწერა', default: { color: WINE, font: SANS, size: 'md' } },
    { key: 'heading', label: 'სათაური', default: { color: CHARCOAL, font: DISPLAY, size: 'md' } },
  ],
  gallery: [
    { key: 'eyebrow', label: 'ზედწარწერა', default: { color: WINE, font: SANS, size: 'md' } },
    { key: 'heading', label: 'სათაური', default: { color: CHARCOAL, font: DISPLAY, size: 'md' } },
  ],
  about: [
    { key: 'eyebrow', label: 'ზედწარწერა', default: { color: WINE, font: SANS, size: 'md' } },
    { key: 'heading', label: 'სათაური', default: { color: CHARCOAL, font: DISPLAY, size: 'md' } },
    { key: 'body', label: 'ტექსტი', default: { color: CHARCOAL_MUTED, font: SANS, size: 'md' } },
  ],
  contact: [
    { key: 'eyebrow', label: 'ზედწარწერა', default: { color: WINE, font: SANS, size: 'md' } },
    { key: 'heading', label: 'სათაური', default: { color: CHARCOAL, font: DISPLAY, size: 'md' } },
  ],
}

// Each element's natural font-size in rem — the anchor that HEADING_SIZE_MULTIPLIER scales from.
export const SECTION_ELEMENT_BASE_REM: Record<SectionKey, Record<string, number>> = {
  hero: { siteName: 1.875, slogan: 1, headline: 1.875, subline: 1, cta: 1 },
  wines: { eyebrow: 0.75, heading: 3 },
  news: { eyebrow: 0.75, heading: 3 },
  gallery: { eyebrow: 0.75, heading: 3 },
  about: { eyebrow: 1, heading: 3, body: 1 },
  contact: { eyebrow: 0.75, heading: 3 },
}

export function buildDefaultSectionStyles(): Record<SectionKey, SectionStyle> {
  const keys = Object.keys(SITE_SECTION_ELEMENTS) as SectionKey[]
  return keys.reduce((acc, key) => {
    const elements = SITE_SECTION_ELEMENTS[key].reduce((els, el) => {
      els[el.key] = el.default
      return els
    }, {} as SectionStyle['elements'])
    acc[key] = { elements }
    return acc
  }, {} as Record<SectionKey, SectionStyle>)
}
