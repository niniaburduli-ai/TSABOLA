'use client'

import { useTheme } from 'next-themes'

import { HEADING_SIZE_MULTIPLIER } from '@/shared/const/heading-size.const'
import { resolveElementStyle, SECTION_ELEMENT_BASE_REM, SITE_SECTION_ELEMENTS } from '@/shared/const/site-section-elements.const'
import { invertLightnessForDarkMode } from '@/shared/utils/color'

import { useLang } from './use-lang'

import type { SectionKey } from '../types'

// Callback ref (not useRef+useEffect) so the same style can be applied to every node
// in a .map() of repeated elements (e.g. About's paragraph list), not just a single one.
// The hero always sits on its own dark photo backdrop, and contact always sits on its own
// fixed cream map backdrop, so both are exempt from the site-wide night mode toggle —
// their text colors are already tuned for their own backdrop, not the page theme.
// The eyebrow label is the wine brand accent (same role as the header logo, which is a
// static text-wine with no dark-mode variant) — it stays the exact same wine color in
// both modes instead of being lightness-inverted like body/heading text.
export function useTextStyle<T extends HTMLElement>(section: SectionKey, elementKey: string) {
  const { theme } = useLang()
  const { resolvedTheme } = useTheme()
  const override = theme.sections[section].elements[elementKey]
  const def = SITE_SECTION_ELEMENTS[section].find((e) => e.key === elementKey)!
  const baseRem = SECTION_ELEMENT_BASE_REM[section][elementKey]
  const exemptFromInversion = section === 'hero' || section === 'contact' || elementKey === 'eyebrow'
  const resolved = resolveElementStyle(def, theme, override)
  const color =
    resolvedTheme === 'dark' && !exemptFromInversion ? invertLightnessForDarkMode(resolved.color) : resolved.color

  return (el: T | null) => {
    if (!el) return
    el.style.color = color
    el.style.fontFamily = `var(${resolved.font})`
    el.style.fontSize = `${baseRem * HEADING_SIZE_MULTIPLIER[resolved.size]}rem`
  }
}
