export type L = { ka: string; en: string }

export interface WineItem {
  id: string
  name: L
  type: L
  typeBadge: L
  price: string
  description: L
  image: string
}

export interface SiteContent {
  site: { name: L; slogan: L }
  nav: { wines: L; gallery: L; about: L; contact: L }
  hero: { headline: L; subline: L; cta: L }
  wines: WineItem[]
  gallery: { title: L; subtitle: L; images: string[] }
  about: { title: L; body: L; imageAlt: L; image: string }
  contact: { title: L; subtitle: L; email: string; phone: string; address: L }
  footer: { copy: L }
}

export interface ThemeConfig {
  colorWine: string
  colorCharcoal: string
  colorCream: string
  headingSize: 'sm' | 'md' | 'lg'
  bodySize: 'sm' | 'md'
}

export interface SectionVisibility {
  hero: boolean
  wines: boolean
  gallery: boolean
  about: boolean
  contact: boolean
}
