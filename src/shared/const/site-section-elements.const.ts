import type { HeadingSizeScale, SectionKey, SectionStyle, TextElementStyle, ThemeConfig } from '@/features/tsabola/types'
import { hexToRgba } from '@/shared/utils/color'

// Which of the theme's 3 global colors an element inherits from when it has no explicit
// override, and at what opacity (muted/soft variants sit at reduced alpha over the base color).
export type TextElementRole = 'wine' | 'charcoal' | 'charcoal-muted' | 'cream' | 'cream-muted' | 'cream-soft'

// Whether an element inherits the global heading or body font/size when it has no override.
export type TextElementKind = 'heading' | 'body'

export type SectionElementDef = { key: string; label: string; kind: TextElementKind; role: TextElementRole }

const ROLE_ALPHA: Partial<Record<TextElementRole, number>> = {
  'charcoal-muted': 0.65,
  'cream-muted': 0.65,
  'cream-soft': 0.5,
}

function roleBaseColor(role: TextElementRole, theme: ThemeConfig): string {
  if (role.startsWith('wine')) return theme.colorWine
  if (role.startsWith('charcoal')) return theme.colorCharcoal
  return theme.colorCream
}

// Hex-only base color for the admin color picker's default swatch — a color <input> can't
// display an alpha value, so muted/soft roles start the picker from their solid base color.
export function resolveElementRoleBaseHex(role: TextElementRole, theme: ThemeConfig): string {
  return roleBaseColor(role, theme)
}

export function resolveElementRoleColor(role: TextElementRole, theme: ThemeConfig): string {
  const base = roleBaseColor(role, theme)
  const alpha = ROLE_ALPHA[role]
  return alpha ? hexToRgba(base, alpha) : base
}

export function resolveElementStyle(
  def: SectionElementDef,
  theme: ThemeConfig,
  override: TextElementStyle
): { color: string; font: string; size: HeadingSizeScale } {
  return {
    color: override.color ?? resolveElementRoleColor(def.role, theme),
    font: override.font ?? (def.kind === 'heading' ? theme.headingFont : theme.bodyFont),
    size: override.size ?? (def.kind === 'heading' ? theme.headingSize : theme.bodySize),
  }
}

// Single source of truth for both the admin editor's field list and DEFAULT_THEME.sections.
export const SITE_SECTION_ELEMENTS: Record<SectionKey, SectionElementDef[]> = {
  hero: [
    { key: 'siteName', label: 'საიტის სახელი', kind: 'heading', role: 'cream' },
    { key: 'slogan', label: 'სლოგანი', kind: 'body', role: 'cream-muted' },
    { key: 'headline', label: 'სათაური', kind: 'heading', role: 'cream' },
    { key: 'subline', label: 'ქვესათაური', kind: 'body', role: 'cream-soft' },
    { key: 'cta', label: 'ღილაკი', kind: 'heading', role: 'cream' },
  ],
  wines: [
    { key: 'eyebrow', label: 'ზედწარწერა', kind: 'body', role: 'wine' },
    { key: 'heading', label: 'სათაური', kind: 'heading', role: 'charcoal' },
    { key: 'badge', label: 'ტიპის ნიშანი', kind: 'body', role: 'wine' },
    { key: 'name', label: 'ღვინის სახელი', kind: 'heading', role: 'charcoal' },
    { key: 'details', label: 'დეტალები', kind: 'body', role: 'charcoal-muted' },
    { key: 'price', label: 'ფასი', kind: 'heading', role: 'wine' },
    { key: 'lightboxName', label: 'სახელი (გახსნილი ბარათი)', kind: 'heading', role: 'charcoal' },
    { key: 'longDescription', label: 'სრული აღწერა', kind: 'body', role: 'charcoal-muted' },
    { key: 'meta', label: 'მიირთვით/ალკ/მოცულობა', kind: 'body', role: 'charcoal-muted' },
  ],
  news: [
    { key: 'eyebrow', label: 'ზედწარწერა', kind: 'body', role: 'wine' },
    { key: 'heading', label: 'სათაური', kind: 'heading', role: 'charcoal' },
    { key: 'cardDate', label: 'თარიღი (ბარათი)', kind: 'body', role: 'wine' },
    { key: 'cardTitle', label: 'სათაური (ბარათი)', kind: 'heading', role: 'charcoal' },
    { key: 'cardBody', label: 'ტექსტი (ბარათი)', kind: 'body', role: 'charcoal-muted' },
    { key: 'articleTitle', label: 'სათაური (სტატია)', kind: 'heading', role: 'charcoal' },
    { key: 'articleBody', label: 'ტექსტი (სტატია)', kind: 'body', role: 'charcoal-muted' },
  ],
  gallery: [
    { key: 'eyebrow', label: 'ზედწარწერა', kind: 'body', role: 'wine' },
    { key: 'heading', label: 'სათაური', kind: 'heading', role: 'charcoal' },
    { key: 'caption', label: 'წარწერა (ფოტო)', kind: 'body', role: 'cream' },
    { key: 'date', label: 'თარიღი (სტატია)', kind: 'body', role: 'wine' },
    { key: 'articleCaption', label: 'სათაური (სტატია)', kind: 'heading', role: 'charcoal' },
    { key: 'articleDescription', label: 'აღწერა (სტატია)', kind: 'body', role: 'charcoal-muted' },
  ],
  about: [
    { key: 'eyebrow', label: 'ზედწარწერა', kind: 'body', role: 'wine' },
    { key: 'heading', label: 'სათაური', kind: 'heading', role: 'charcoal' },
    { key: 'body', label: 'ტექსტი', kind: 'body', role: 'charcoal-muted' },
  ],
  contact: [
    { key: 'eyebrow', label: 'ზედწარწერა', kind: 'body', role: 'wine' },
    { key: 'heading', label: 'სათაური', kind: 'heading', role: 'charcoal' },
    { key: 'value', label: 'საკონტაქტო მონაცემები', kind: 'body', role: 'charcoal' },
  ],
}

// Each element's natural font-size in rem — the anchor that HEADING_SIZE_MULTIPLIER scales from.
export const SECTION_ELEMENT_BASE_REM: Record<SectionKey, Record<string, number>> = {
  hero: { siteName: 1.875, slogan: 1, headline: 1.875, subline: 1, cta: 1 },
  wines: {
    eyebrow: 0.75, heading: 3,
    badge: 0.875, name: 1.5, details: 0.75, price: 1.25,
    lightboxName: 1.875, longDescription: 0.875, meta: 0.875,
  },
  news: {
    eyebrow: 0.75, heading: 3,
    cardDate: 0.75, cardTitle: 1, cardBody: 0.875,
    articleTitle: 2.25, articleBody: 1,
  },
  gallery: {
    eyebrow: 0.75, heading: 3,
    caption: 0.75, date: 0.75, articleCaption: 3, articleDescription: 1,
  },
  about: { eyebrow: 1, heading: 3, body: 1 },
  contact: { eyebrow: 0.75, heading: 3, value: 1 },
}

// Per-element mobile override for SECTION_ELEMENT_BASE_REM — falls back to the desktop rem
// when a section/key isn't listed here. Hero mobile hierarchy: siteName and headline match
// each other (the two "voices" of the hero) and both shrink from their desktop size to fit a
// ~340px column without wrapping past 2 lines; everything else (slogan/subline/cta) sits a
// tier below siteName so the hierarchy stays readable at a glance.
export const SECTION_ELEMENT_BASE_REM_MOBILE: Partial<Record<SectionKey, Record<string, number>>> = {
  hero: { siteName: 1.25, slogan: 0.75, headline: 1.25, subline: 0.75, cta: 0.875 },
}

// Every element starts fully inherited from the global theme (no overrides) until an admin
// customizes it in the Section Style tab.
export function buildDefaultSectionStyles(): Record<SectionKey, SectionStyle> {
  const keys = Object.keys(SITE_SECTION_ELEMENTS) as SectionKey[]
  return keys.reduce((acc, key) => {
    const elements = SITE_SECTION_ELEMENTS[key].reduce((els, el) => {
      els[el.key] = {}
      return els
    }, {} as SectionStyle['elements'])
    acc[key] = { elements }
    return acc
  }, {} as Record<SectionKey, SectionStyle>)
}

