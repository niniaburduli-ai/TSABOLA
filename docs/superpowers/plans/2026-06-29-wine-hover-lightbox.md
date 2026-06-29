# Wine Hover & Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating/zoom hover animation to wine bottle images and a click-to-open premium dark modal showing full wine details.

**Architecture:** Lifted state pattern — `TsabolaWineCatalog` holds `selectedWine | null`, passes `onOpen` callback to each `TsabolaWineCard`, and renders a single `TsabolaWineLightbox` portal component. Hover is CSS-only via keyframes in `globals.css`.

**Tech Stack:** React (createPortal for modal), Tailwind CSS (custom utility classes), Vitest + @testing-library/react

## Global Constraints

- No inline styles — all styling via Tailwind classes
- No arbitrary Tailwind values `[...]` — use standard scale only
- Always use `type`, never `interface` (CLAUDE.md §3)
- Always update both `ka` and `en` fields in `site-content.ts`
- No new folders — all files in existing `src/features/tsabola/components/`
- Reduced-motion: all new CSS animations guarded by `@media (prefers-reduced-motion: reduce)`

---

## File Map

| Action | File |
|---|---|
| Modify | `src/app/globals.css` |
| Modify | `src/features/tsabola/types/index.ts` |
| Modify | `src/features/tsabola/content/site-content.ts` |
| Create | `src/features/tsabola/components/tsabola-wine-lightbox.tsx` |
| Modify | `src/features/tsabola/components/tsabola-wine-card.tsx` |
| Modify | `src/features/tsabola/components/tsabola-wine-catalog.tsx` |
| Modify | `src/features/tsabola/components/__tests__/tsabola-wine-catalog.test.tsx` |

---

### Task 1: Add CSS animation utilities to globals.css

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `.animate-wine-float` class (3s floating translateY loop), `.animate-modal-fade` class (overlay fade-in), `.animate-modal-slide` class (panel scale+fade entry)

- [ ] **Step 1: Add keyframes and utility classes inside the existing `@layer utilities` block**

Open `src/app/globals.css`. Inside the existing `@layer utilities { ... }` block (currently ends at line ~186), append after `.animate-rise-4`:

```css
  @keyframes wine-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  .animate-wine-float {
    animation: wine-float 3s ease-in-out infinite;
  }

  @keyframes modal-fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-modal-fade {
    animation: modal-fade 0.2s ease-out both;
  }

  @keyframes modal-slide {
    from { opacity: 0; transform: translateY(10px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .animate-modal-slide {
    animation: modal-slide 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
```

- [ ] **Step 2: Add new classes to the existing reduced-motion guard**

The file already has `@media (prefers-reduced-motion: reduce) { ... }` at the bottom. Add the new classes to it:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-rise,
  .animate-rise-1,
  .animate-rise-2,
  .animate-rise-3,
  .animate-rise-4,
  .animate-hero-scroll,
  .hero-slide-fade,
  .animate-wine-float,
  .animate-modal-fade,
  .animate-modal-slide {
    animation: none;
    transition: none;
  }
}
```

- [ ] **Step 3: Verify lint passes**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add wine-float and modal animation utilities to globals.css"
```

---

### Task 2: Extend WineItem type and populate site-content

**Files:**
- Modify: `src/features/tsabola/types/index.ts`
- Modify: `src/features/tsabola/content/site-content.ts`

**Interfaces:**
- Produces: `WineItem` (type, not interface) with optional fields `longDescription?: L`, `serveTemp?: string`, `alcohol?: string`, `volume?: string`

- [ ] **Step 1: Replace the entire `src/features/tsabola/types/index.ts`**

```ts
export type L = { ka: string; en: string }

export type WineItem = {
  id: string
  name: L
  type: L
  typeBadge: L
  price: string
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
  headingSize: 'sm' | 'md' | 'lg'
  bodySize: 'sm' | 'md'
}

export type SectionVisibility = {
  hero: boolean
  wines: boolean
  news: boolean
  gallery: boolean
  about: boolean
  contact: boolean
}
```

- [ ] **Step 2: Add the new fields to both wine entries in `src/features/tsabola/content/site-content.ts`**

In the `wines` array, replace the `white` wine entry's closing `}` to add new fields. The full updated white wine entry:

```ts
{
  id: 'white',
  name: { ka: 'თეთრი ღვინო', en: 'White Wine' },
  type: { ka: 'თეთრი', en: 'White' },
  typeBadge: { ka: 'თეთრი', en: 'White' },
  price: '30₾',
  description: {
    ka: 'სუფთა, ყვავილოვანი. ატმის, ჟასმინის ნოტებით.',
    en: 'Crisp and floral. Hints of white peach and jasmine.',
  },
  image: '/white wine.png',
  details: {
    ka: 'ღვინო: თეთრი მშრალი | ყურძენი: ჩინებული\nრეგიონი: ზემო ხანდაკი; შიდა ქართლი.',
    en: 'Wine: White Dry | Grape: Chinebuli\nRegion: Zemo Khandaki; Shida Kartli.',
  },
  longDescription: {
    ka: '„ცაბოს" თეთრი მშრალი ღვინო დამზადებულია შიდა ქართლის, სოფელ ზემო ხანდაკში მოწეული ჩინებულის ჯიშის რჩეული ყურძნისგან. ღვინო გამოირჩევა ღია ჩალისფერი შეფერილობით, ნაზი არომატით, სასიამოვნო სიხალისითა და ჰარმონიული, ხანგრძლივი დაბოლოებით.',
    en: 'Tsabo\'s White Dry wine is crafted from select Chinebuli grapes grown in the village of Zemo Khandaki, Shida Kartli. The wine is distinguished by its pale straw colour, delicate aroma, pleasant freshness, and harmonious, lingering finish.',
  },
  serveTemp: '10–12°C',
  alcohol: '13%',
  volume: '750 მლ',
},
```

The full updated red wine entry:

```ts
{
  id: 'red',
  name: { ka: 'წითელი ღვინო', en: 'Red Wine' },
  type: { ka: 'წითელი', en: 'Red' },
  typeBadge: { ka: 'წითელი', en: 'Red' },
  price: '50₾',
  description: {
    ka: 'მუხის კასრში დავარგებული. მუქი კენკრა, შავი ალუბალი, ტყავი.',
    en: 'Oak-aged full body. Dark berry, black cherry, leather.',
  },
  image: '/red wine.png',
  details: {
    ka: 'ღვინო: წითელი მშრალი | ყურძენი: დანახარული\nრეგიონი: ზემო ხანდაკი; შიდა ქართლი.',
    en: 'Wine: Red Dry | Grape: Danakharuli\nRegion: Zemo Khandaki; Shida Kartli.',
  },
  longDescription: {
    ka: '„ცაბოს" წითელი მშრალი ღვინო დამზადებულია შიდა ქართლის, სოფელ ზემო ხანდაკში მოწეული დანახარულის ჯიშის ყურძნისგან და ვარდისფერ მუხის კასრებში ვარდება. ღვინო გამოირჩევა ინტენსიური მუქი-ყავისფერი შეფერილობით, მდიდარი კენკრის, შავი ალუბლისა და ვანილის ნოტებით, ხანგრძლივი, ვარდისფრულ-ტანინიანი დაბოლოებით.',
    en: 'Tsabo\'s Red Dry wine is crafted from select Danakharuli grapes grown in Zemo Khandaki, Shida Kartli, and aged in oak barrels. It is characterised by a deep dark-ruby colour, rich notes of dark berry, black cherry, and vanilla, with a long, smooth tannic finish.',
  },
  serveTemp: '16–18°C',
  alcohol: '13.5%',
  volume: '750 მლ',
},
```

- [ ] **Step 3: Run build to verify TypeScript compiles**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/tsabola/types/index.ts src/features/tsabola/content/site-content.ts
git commit -m "feat: extend WineItem type with modal fields and populate wine content"
```

---

### Task 3: Build TsabolaWineLightbox component

**Files:**
- Create: `src/features/tsabola/components/tsabola-wine-lightbox.tsx`

**Interfaces:**
- Consumes: `WineItem` (from `../types`), `r` helper (from `../hooks/use-lang`)
- Produces: `TsabolaWineLightbox({ wine, lang, open, onClose })` — portal-based modal, renders into `document.body`

- [ ] **Step 1: Write the failing test first**

Add a new describe block to `src/features/tsabola/components/__tests__/tsabola-wine-catalog.test.tsx`:

```ts
import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'
import { useContentStore } from '../../store/content-store'
import { useLanguageStore } from '../../store/language-store'
import { TsabolaWineCatalog } from '../tsabola-wine-catalog'

beforeEach(() => {
  useLanguageStore.setState({ lang: 'ka' })
  useContentStore.setState({ content: DEFAULT_CONTENT, theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY })
})

describe('TsabolaWineCatalog', () => {
  it('renders all wines', () => {
    render(<TsabolaWineCatalog />)
    expect(screen.getByText('თეთრი ღვინო')).toBeInTheDocument()
    expect(screen.getByText('წითელი ღვინო')).toBeInTheDocument()
  })

  it('renders prices', () => {
    render(<TsabolaWineCatalog />)
    expect(screen.getByText('30₾')).toBeInTheDocument()
    expect(screen.getByText('50₾')).toBeInTheDocument()
  })

  it('renders type badges in ka', () => {
    render(<TsabolaWineCatalog />)
    expect(screen.getByText('თეთრი')).toBeInTheDocument()
    expect(screen.getByText('წითელი')).toBeInTheDocument()
  })

  it('opens lightbox when wine image is clicked', () => {
    render(<TsabolaWineCatalog />)
    const buttons = screen.getAllByRole('button', { name: /თეთრი ღვინო/i })
    fireEvent.click(buttons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/ჩინებულის ჯიშის/)).toBeInTheDocument()
  })

  it('closes lightbox when close button is clicked', () => {
    render(<TsabolaWineCatalog />)
    const imageButtons = screen.getAllByRole('button', { name: /თეთრი ღვინო/i })
    fireEvent.click(imageButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes lightbox on Escape key', () => {
    render(<TsabolaWineCatalog />)
    const imageButtons = screen.getAllByRole('button', { name: /თეთრი ღვინო/i })
    fireEvent.click(imageButtons[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to confirm new tests fail**

```bash
npx vitest run src/features/tsabola/components/__tests__/tsabola-wine-catalog.test.tsx
```

Expected: the 3 existing tests PASS, the 3 new tests FAIL (component not updated yet).

- [ ] **Step 3: Create `src/features/tsabola/components/tsabola-wine-lightbox.tsx`**

```tsx
'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { r } from '../hooks/use-lang'
import type { WineItem } from '../types'

type Props = {
  wine: WineItem | null
  lang: 'ka' | 'en'
  open: boolean
  onClose: () => void
}

export function TsabolaWineLightbox({ wine, lang, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', handler)
    }
  }, [open, onClose])

  if (!open || !wine) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={r(wine.name, lang)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-modal-fade"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative bg-charcoal text-cream w-full max-w-3xl max-h-screen overflow-y-auto shadow-2xl animate-modal-slide">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/5 flex items-center justify-center p-8 min-h-64 bg-charcoal/60">
            {wine.image ? (
              <img
                src={wine.image}
                alt={r(wine.name, lang)}
                className="max-h-80 w-auto object-contain"
              />
            ) : (
              <div className="w-32 h-64 bg-wine/20 rounded" />
            )}
          </div>

          <div className="md:w-3/5 p-8 flex flex-col gap-4">
            <span className="inline-block self-start px-2.5 py-0.5 text-xs font-semibold tracking-widest uppercase border border-wine/40 text-wine">
              {r(wine.typeBadge, lang)}
            </span>

            <h2 className="font-display text-3xl font-bold text-cream">
              {r(wine.name, lang)}
            </h2>

            <div className="w-8 h-px bg-wine/60" />

            {wine.details && (
              <div className="flex flex-col gap-1">
                {r(wine.details, lang).split('\n').map((line, i) => (
                  <p key={i} className="text-xs text-cream/60 tracking-wide">
                    {line}
                  </p>
                ))}
              </div>
            )}

            {wine.longDescription && (
              <p className="text-sm text-cream/80 leading-relaxed italic">
                {r(wine.longDescription, lang)}
              </p>
            )}

            {(wine.serveTemp || wine.alcohol || wine.volume) && (
              <div className="flex flex-wrap gap-6 mt-auto pt-4 border-t border-cream/10">
                {wine.serveTemp && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-cream/40 tracking-widest uppercase">
                      {lang === 'ka' ? 'მიირთვით' : 'Serve'}
                    </span>
                    <span className="text-sm font-semibold text-cream">{wine.serveTemp}</span>
                  </div>
                )}
                {wine.alcohol && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-cream/40 tracking-widest uppercase">
                      {lang === 'ka' ? 'ალკ' : 'Alc'}
                    </span>
                    <span className="text-sm font-semibold text-cream">{wine.alcohol}</span>
                  </div>
                )}
                {wine.volume && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-cream/40 tracking-widest uppercase">
                      {lang === 'ka' ? 'მოცულობა' : 'Volume'}
                    </span>
                    <span className="text-sm font-semibold text-cream">{wine.volume}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/tsabola/components/tsabola-wine-lightbox.tsx
git commit -m "feat: add TsabolaWineLightbox portal component"
```

---

### Task 4: Update TsabolaWineCard with hover animation and onOpen prop

**Files:**
- Modify: `src/features/tsabola/components/tsabola-wine-card.tsx`

**Interfaces:**
- Consumes: `WineItem` (from `../types`), `r` (from `../hooks/use-lang`)
- Produces: `TsabolaWineCard({ item, lang, onOpen })` — image wrapped in `<button>`, hover float+zoom on image

- [ ] **Step 1: Replace the full file**

```tsx
'use client'

import { r } from '../hooks/use-lang'
import type { WineItem } from '../types'

type Props = {
  item: WineItem
  lang: 'ka' | 'en'
  onOpen: (wine: WineItem) => void
}

export function TsabolaWineCard({ item, lang, onOpen }: Props) {
  return (
    <article className="group flex flex-col bg-white border border-border-wine hover:border-wine/60 transition-colors duration-300">
      {item.image ? (
        <button
          type="button"
          onClick={() => onOpen(item)}
          aria-label={r(item.name, lang)}
          className="w-full h-80 bg-cream/20 flex items-center justify-center p-4 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-wine/50"
        >
          <div className="h-full w-full flex items-center justify-center group-hover:animate-wine-float">
            <img
              src={item.image}
              alt={r(item.name, lang)}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </button>
      ) : (
        <div
          data-placeholder="true"
          className="w-full h-80 bg-gradient-to-br from-wine/10 via-cream to-charcoal/10"
        />
      )}

      <div className="p-6 flex flex-col gap-3 flex-1">
        <span className="inline-block self-start px-2.5 py-0.5 text-xs font-semibold tracking-widest uppercase border border-wine/40 text-wine">
          {r(item.typeBadge, lang)}
        </span>
        <h3 className="font-display text-2xl font-bold text-charcoal">{r(item.name, lang)}</h3>
        {item.details && (
          <div className="border-t border-wine/10 pt-3">
            {r(item.details, lang).split('\n').map((line, i) => (
              <p key={i} className="text-xs text-charcoal/50 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        )}
        <p className="font-display text-xl font-bold text-wine mt-auto">{item.price}</p>
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/tsabola/components/tsabola-wine-card.tsx
git commit -m "feat: add hover float/zoom animation and onOpen prop to TsabolaWineCard"
```

---

### Task 5: Wire TsabolaWineCatalog — lifted state + render lightbox

**Files:**
- Modify: `src/features/tsabola/components/tsabola-wine-catalog.tsx`

**Interfaces:**
- Consumes: `TsabolaWineCard({ item, lang, onOpen })`, `TsabolaWineLightbox({ wine, lang, open, onClose })`

- [ ] **Step 1: Replace the full file**

```tsx
'use client'

import { useState } from 'react'
import { TsabolaWineCard } from './tsabola-wine-card'
import { TsabolaWineLightbox } from './tsabola-wine-lightbox'
import { useLang } from '../hooks/use-lang'
import type { WineItem } from '../types'

export function TsabolaWineCatalog() {
  const { t, lang, r } = useLang()
  const [selectedWine, setSelectedWine] = useState<WineItem | null>(null)

  return (
    <section id="wines" className="bg-cream py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-3">
            {r(t.nav.wines)}
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal">
            {r(t.nav.wines)}
          </h2>
          <div className="w-12 h-0.5 bg-wine mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {t.wines.map((wine) => (
            <TsabolaWineCard
              key={wine.id}
              item={wine}
              lang={lang}
              onOpen={setSelectedWine}
            />
          ))}
        </div>
      </div>

      <TsabolaWineLightbox
        wine={selectedWine}
        lang={lang}
        open={selectedWine !== null}
        onClose={() => setSelectedWine(null)}
      />
    </section>
  )
}
```

- [ ] **Step 2: Run the full test suite**

```bash
npx vitest run src/features/tsabola/components/__tests__/tsabola-wine-catalog.test.tsx
```

Expected: ALL 6 tests pass.

- [ ] **Step 3: Run build to confirm no TypeScript errors**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/features/tsabola/components/tsabola-wine-catalog.tsx
git commit -m "feat: wire wine lightbox into catalog with lifted selectedWine state"
```
