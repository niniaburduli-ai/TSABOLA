'use client'

import Link from 'next/link'

import { useLang } from '../hooks/use-lang'
import { useSiteContentSync } from '../hooks/use-site-content-sync'

const NAV_LINKS = [
  { key: 'wines', href: '/#wines' },
  { key: 'news', href: '/news' },
  { key: 'gallery', href: '/gallery' },
  { key: 'about', href: '/#about' },
  { key: 'contact', href: '/#contact' },
] as const

export function TsabolaHeader() {
  useSiteContentSync()
  const { t, lang, setLang, r } = useLang()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-cream/90 border-b border-border-wine">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl font-bold text-wine tracking-wide">
          {r(t.site.name)}
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              className="text-sm font-medium text-charcoal hover:text-wine transition-colors duration-200"
            >
              {r(t.nav[key])}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 text-sm font-semibold">
          <button
            onClick={() => setLang('ka')}
            className={`px-2 py-1 rounded transition-colors ${lang === 'ka' ? 'text-wine font-bold' : 'text-charcoal/40 hover:text-charcoal'}`}
          >
            KA
          </button>
          <span className="text-charcoal/20">/</span>
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-1 rounded transition-colors ${lang === 'en' ? 'text-wine font-bold' : 'text-charcoal/40 hover:text-charcoal'}`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  )
}
