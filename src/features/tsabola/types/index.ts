import type { ImageSize } from '@/shared/types/common'

export type { ImageSize }

export type L = { ka: string; en: string }

export type WineItem = {
  id: string
  name: L
  type: L
  typeBadge: L
  price: string
  discountPrice?: string
  description: L
  image: string
  imageSize: ImageSize
  details?: L
  longDescription?: L
  serveTemp?: string
  alcohol?: string
  volume?: string
}

export type NewsItem = {
  id: string
  slug: string
  published: boolean
  title: L
  date: L
  body: L
  image: string
}

export type HeroImagePosition = 'top' | 'center' | 'bottom'

export type HeroImage = {
  src: string
  positionMobile: HeroImagePosition
  positionDesktop: HeroImagePosition
  size: ImageSize
}

export type SiteContent = {
  site: { name: L; slogan: L }
  nav: { wines: L; gallery: L; about: L; contact: L; news: L }
  hero: { headline: L; subline: L; cta: L; images: HeroImage[] }
  wines: { title: L; subtitle: L; items: WineItem[] }
  news: { title: L; subtitle: L; items: NewsItem[] }
  gallery: { title: L; subtitle: L; images: string[] }
  about: { title: L; body: L; imageAlt: L; image: string; imageSize: ImageSize }
  contact: { title: L; subtitle: L; email: string; phone: string; whatsapp: string; address: L }
  footer: { copy: L }
}

export type SectionVisibility = {
  hero: boolean
  wines: boolean
  news: boolean
  gallery: boolean
  about: boolean
  contact: boolean
}

export type SectionKey = keyof SectionVisibility

export type HeadingSizeScale = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// One independently-styleable line of text within a section (e.g. hero's headline vs its slogan).
export type TextElementStyle = {
  color: string
  font: string
  size: HeadingSizeScale
}

export type SectionStyle = {
  elements: Record<string, TextElementStyle>
}

export type ThemeConfig = {
  colorWine: string
  colorCharcoal: string
  colorCream: string
  headingSize: HeadingSizeScale
  bodySize: 'xs' | 'sm' | 'md' | 'lg'
  headingFont: string
  bodyFont: string
  sections: Record<SectionKey, SectionStyle>
}
