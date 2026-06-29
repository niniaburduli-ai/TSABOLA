export type L = { ka: string; en: string }

export interface WineItem {
  id: string
  name: L
  type: L
  typeBadge: L
  price: string
  description: L
  image: string
  details?: L
}

export type NewsItem = {
  id: string
  title: L
  date: string
  body: L
  image: string
}

export interface SiteContent {
  site: { name: L; slogan: L }
  nav: { wines: L; gallery: L; about: L; contact: L; news: L }
  hero: { headline: L; subline: L; cta: L; images: string[] }
  wines: WineItem[]
  news: { title: L; subtitle: L; items: NewsItem[] }
  gallery: { title: L; subtitle: L; images: string[] }
  about: { title: L; body: L; imageAlt: L; image: string }
  contact: { title: L; subtitle: L; email: string; phone: string; whatsapp: string; address: L }
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
  news: boolean
  gallery: boolean
  about: boolean
  contact: boolean
}
