'use client'

import { useLang } from '../hooks/use-lang'

export function TsabolaHeader() {
  const { t, lang, setLang, r } = useLang()

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-cream/90 border-b border-border-wine">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="font-display text-2xl font-bold text-wine tracking-wide">
          {r(t.site.name)}
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {(['wines', 'gallery', 'about', 'contact'] as const).map((key) => (
            <a
              key={key}
              href={`#${key}`}
              className="text-sm font-medium text-charcoal hover:text-wine transition-colors duration-200"
            >
              {r(t.nav[key])}
            </a>
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
