'use client'

import { useLang } from '../hooks/use-lang'

export function TsabolaFooter() {
  const { t, r } = useLang()

  return (
    <footer className="bg-charcoal text-cream py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <span className="font-display text-xl font-bold text-wine">{r(t.site.name)}</span>

        <nav className="flex items-center gap-6 text-sm text-cream/60">
          {(['wines', 'gallery', 'about', 'contact'] as const).map((key) => (
            <a key={key} href={`#${key}`} className="hover:text-cream transition-colors">
              {r(t.nav[key])}
            </a>
          ))}
        </nav>

        <p className="text-xs text-cream/40">{r(t.footer.copy)}</p>
      </div>
    </footer>
  )
}
