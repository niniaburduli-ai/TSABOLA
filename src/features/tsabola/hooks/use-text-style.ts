'use client'

import { HEADING_SIZE_MULTIPLIER } from '@/shared/const/heading-size.const'
import {
  resolveElementStyle,
  SECTION_ELEMENT_BASE_REM,
  SECTION_ELEMENT_BASE_REM_MOBILE,
  SITE_SECTION_ELEMENTS,
} from '@/shared/const/site-section-elements.const'
import { invertLightnessForDarkMode } from '@/shared/utils/color'

import { useLang } from './use-lang'

import type { SectionKey } from '../types'
import type { CSSProperties } from 'react'

type TextStyleVars = CSSProperties & {
  '--ts-fs-mobile': string
  '--ts-fs-desktop': string
  '--ts-color-light': string
  '--ts-color-dark': string
}

// Returned as a plain style object + className (not a ref) so the size/color/font are
// already present in the server-rendered HTML — a ref only runs after hydration, which
// left a visible flash from the element's fallback Tailwind text size to the admin-configured
// one on every full page load/refresh. Both light and dark color variants are emitted as
// custom properties and picked between by the `.dark` class in CSS (see .ts-responsive-text
// in globals.css) rather than branching in JS on next-themes' `resolvedTheme` — that value
// only settles after a post-mount effect, which left text using the wrong color until a
// theme toggle forced a re-render. The hero always sits on its own dark photo backdrop,
// so it's exempt from the site-wide night mode toggle — its text colors are already tuned
// for that backdrop, not the page theme. Contact now swaps its own map backdrop and section
// background with the theme (see tsabola-contact.tsx), so its charcoal-role text inverts like
// any other body section. Any element with the wine brand-accent role (eyebrow, badge, price,
// cardDate, gallery date, same role as the header logo, which is a static text-wine with no
// dark-mode variant) stays the exact same wine color in both modes instead of being
// lightness-inverted like body/heading text — otherwise the accent goes muted/faded in dark
// mode in some spots but not others.
export function useTextStyle(section: SectionKey, elementKey: string): { style: TextStyleVars; className: string } {
  const { theme } = useLang()
  const override = theme.sections[section].elements[elementKey]
  const def = SITE_SECTION_ELEMENTS[section].find((e) => e.key === elementKey)!
  const desktopRem = SECTION_ELEMENT_BASE_REM[section][elementKey]
  const mobileRem = SECTION_ELEMENT_BASE_REM_MOBILE[section]?.[elementKey] ?? desktopRem
  const exemptFromInversion = section === 'hero' || def.role === 'wine'
  const resolved = resolveElementStyle(def, theme, override)
  const colorDark = exemptFromInversion ? resolved.color : invertLightnessForDarkMode(resolved.color)
  const multiplier = HEADING_SIZE_MULTIPLIER[resolved.size]
  // Mobile rems are tuned to fit their own narrow layout at multiplier 1 — an admin picking
  // "lg"/"xl" for desktop shouldn't blow that fit up again. Shrinking (xs/sm, multiplier < 1)
  // still applies on mobile; only the scale-up above the tuned baseline is capped.
  const mobileMultiplier = Math.min(multiplier, 1)

  return {
    style: {
      fontFamily: `var(${resolved.font})`,
      '--ts-fs-mobile': `${mobileRem * mobileMultiplier}rem`,
      '--ts-fs-desktop': `${desktopRem * multiplier}rem`,
      '--ts-color-light': resolved.color,
      '--ts-color-dark': colorDark,
    },
    className: 'ts-responsive-text',
  }
}
