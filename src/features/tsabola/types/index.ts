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
  date: string
  body: L
  image: string
}

export type SiteContent = {
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

export type ThemeConfig = {
  colorWine: string
  colorCharcoal: string
  colorCream: string
  headingSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  bodySize: 'xs' | 'sm' | 'md' | 'lg'
  headingFont: string
  bodyFont: string
}

export type SectionVisibility = {
  hero: boolean
  wines: boolean
  news: boolean
  gallery: boolean
  about: boolean
  contact: boolean
}
