'use client'

import { Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

import { useLang } from '../hooks/use-lang'
import { useSiteContentSync } from '../hooks/use-site-content-sync'

function subscribeNoop() {
  return () => {}
}

function getClientSnapshot() {
  return true
}

function getServerSnapshot() {
  return false
}

const NAV_LINKS = [
  { key: 'wines', href: '/#wines' },
  { key: 'news', href: '/news' },
  { key: 'gallery', href: '/#gallery' },
  { key: 'about', href: '/#about' },
  { key: 'contact', href: '/#contact' },
] as const

const GEORGIA_CROSS_CENTERS = [
  [15, 10],
  [45, 10],
  [15, 30],
  [45, 30],
] as const

function GeorgiaFlagIcon() {
  return (
    <span className="block w-5 h-5 rounded-full overflow-hidden">
      <svg viewBox="0 0 60 40" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <rect width="60" height="40" fill="#fff" />
        <rect x="26" width="8" height="40" fill="#ff0000" />
        <rect y="16" width="60" height="8" fill="#ff0000" />
        {GEORGIA_CROSS_CENTERS.map(([cx, cy]) => (
          <g key={`${cx}-${cy}`} fill="#ff0000">
            <rect x={cx - 3} y={cy - 1} width="6" height="2" />
            <rect x={cx - 1} y={cy - 3} width="2" height="6" />
          </g>
        ))}
      </svg>
    </span>
  )
}

function UkFlagIcon() {
  return (
    <span className="block w-5 h-5 rounded-full overflow-hidden">
      <svg viewBox="0 0 60 40" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        <rect width="60" height="40" fill="#00247d" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="8" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#cf142b" strokeWidth="3" />
        <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="13" />
        <path d="M30,0 V40 M0,20 H60" stroke="#cf142b" strokeWidth="8" />
      </svg>
    </span>
  )
}

export function TsabolaHeader() {
  useSiteContentSync()
  const { t, lang, setLang, r } = useLang()
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot)

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-cream/90 dark:bg-charcoal/90 border-b border-border-wine dark:border-cream/10">
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
        <Link href="/" className="font-display text-3xl font-bold text-wine tracking-wide">
          {r(t.site.name)}
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              className="text-lg font-medium text-charcoal dark:text-cream hover:text-wine transition-colors duration-200"
            >
              {r(t.nav[key])}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang('ka')}
              aria-label="ქართული"
              className={[
                'rounded-full transition-opacity duration-200',
                lang === 'ka' ? 'opacity-100 ring-2 ring-wine ring-offset-2 ring-offset-cream dark:ring-offset-charcoal' : 'opacity-40 hover:opacity-70',
              ].join(' ')}
            >
              <GeorgiaFlagIcon />
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              aria-label="English"
              className={[
                'rounded-full transition-opacity duration-200',
                lang === 'en' ? 'opacity-100 ring-2 ring-wine ring-offset-2 ring-offset-cream dark:ring-offset-charcoal' : 'opacity-40 hover:opacity-70',
              ].join(' ')}
            >
              <UkFlagIcon />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to night mode'}
            className="w-8 h-8 flex items-center justify-center rounded text-charcoal/60 dark:text-cream/60 hover:text-wine transition-colors"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </div>
    </header>
  )
}
