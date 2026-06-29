# News Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bilingual News section (card grid) between Wines and Gallery, with full admin editor support.

**Architecture:** Follows the exact feature-based pattern in `src/features/tsabola/`. Types extend `SiteContent` and `SectionVisibility`; defaults extend `DEFAULT_CONTENT`; a new public component is mounted in `TsabolaPage`; a new admin editor is wired into the existing `AdminPanel`/`AdminSidebar`/`VisibilityEditor`.

**Tech Stack:** Next.js 16 App Router, React, Zustand (persist), Tailwind CSS, Vitest + Testing Library

## Global Constraints

- No inline styles (`style={{}}`), no arbitrary Tailwind bracket values (`text-[10px]`)
- New types use `type`, not `interface`
- All cross-directory imports use `@/` alias — never `../`
- All bilingual text fields are `L = { ka: string; en: string }`
- No `unknown` casts
- CLAUDE.md architecture rules apply: all files in their designated folder

---

### Task 1: Types and Defaults

**Files:**
- Modify: `src/features/tsabola/types/index.ts`
- Modify: `src/features/tsabola/content/site-content.ts`

**Interfaces:**
- Produces: `NewsItem` type, `SiteContent.news`, `SiteContent.nav.news`, `SectionVisibility.news`, `DEFAULT_CONTENT.news`, `DEFAULT_CONTENT.nav.news`, `DEFAULT_VISIBILITY.news` — consumed by all subsequent tasks

- [ ] **Step 1: Add `NewsItem` type and extend interfaces in `src/features/tsabola/types/index.ts`**

  After the existing `WineItem` block and before `SiteContent`, insert the new type. Then add `news` to `SiteContent` and `SiteContent.nav`, and `news` to `SectionVisibility`.

  Full updated file:

  ```ts
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
  ```

- [ ] **Step 2: Add news defaults to `src/features/tsabola/content/site-content.ts`**

  Full updated file:

  ```ts
  import type { SiteContent, ThemeConfig, SectionVisibility } from '../types'

  export const DEFAULT_CONTENT: SiteContent = {
    site: {
      name: { ka: 'ცაბო', en: 'TSABO' },
      slogan: { ka: 'ტრადიცია ქართლის გულიდან', en: 'Tradition from the Heart of Kartli' },
    },
    nav: {
      wines: { ka: 'ღვინოები', en: 'Wines' },
      gallery: { ka: 'გალერეა', en: 'Gallery' },
      about: { ka: 'ჩვენ შესახებ', en: 'About' },
      contact: { ka: 'კონტაქტი', en: 'Contact' },
      news: { ka: 'სიახლეები', en: 'News' },
    },
    hero: {
      headline: { ka: 'კახეთის სულისკვეთება', en: 'The Spirit of Kakheti' },
      subline: {
        ka: 'ოჯახური მარნის ტრადიცია სამი თაობის განმავლობაში',
        en: 'A family winery tradition spanning three generations',
      },
      cta: { ka: 'ღვინოები აღმოაჩინე', en: 'Discover Our Wines' },
      images: ['/TSABO WHITE.png', '/TSABO RED.png'],
    },
    wines: [
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
      },
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
      },
    ],
    news: {
      title: { ka: 'სიახლეები', en: 'News' },
      subtitle: { ka: 'განახლებები', en: 'Updates' },
      items: [
        {
          id: 'news-1',
          title: { ka: '2024 ყვავება — ახალი მოსავალი', en: '2024 Harvest — New Vintage' },
          date: 'January 2025',
          body: {
            ka: 'ჩვენი 2024 წლის მოსავალი მზადაა. ახალი ბოთლები ხელმისაწვდომია.',
            en: 'Our 2024 harvest vintage is ready. New bottles are now available.',
          },
          image: '',
        },
        {
          id: 'news-2',
          title: { ka: 'სეზონური ფასდაკლება', en: 'Seasonal Discount' },
          date: 'December 2024',
          body: {
            ka: 'ყველა თეთრ ღვინოზე 15% ფასდაკლება. შეთავაზება 31 დეკემბრამდე.',
            en: '15% off all white wines. Offer valid until December 31.',
          },
          image: '',
        },
      ],
    },
    gallery: {
      title: { ka: 'გალერეა', en: 'Gallery' },
      subtitle: { ka: 'ვენახი, მარანი, ხელოვნება', en: 'Vineyard, Cellar, Craft' },
      images: ['', '', '', '', '', ''],
    },
    about: {
      title: { ka: '"ცაბო" — ტრადიცია ქართლის გულიდან', en: '"Tsabo" — A Tradition from the Heart of Kartli' },
      body: {
        ka: '2018 წლიდან შიდა ქართლის გულში, კასპის მადლიან მიწაზე, სოფელ ზემო ხანდაკში ახალი, თუმცა უძველეს ფესვებზე აღმოცენებული ამბავი იწერება. „ცაბო" ოჯახური სახელია, რომელიც ღვინის უდიდეს სიყვარულს აერთიანებს. ჩვენ გვჯერა მინიმალური ჩარევის: ღვინო თავად იწმინდება, თავად იბადება და ვენახიდან პირდაპირ თქვენს მაგიდაზე ხვდება. გაუზიარეთ ერთმანეთს ხელნაკეთი სიყვარული.',
        en: 'Since 2018, in the heart of Shida Kartli, on the blessed land of Kaspi, in the village of Zemo Khandaki, a new yet ancient-rooted story is being written. "Tsabo" is a family name that embodies a deep love for wine. We believe in minimal intervention: the wine purifies itself, is born on its own, and travels directly from the vineyard to your table. Share this handcrafted love with one another.',
      },
      imageAlt: { ka: 'ოჯახური მარანი', en: 'Family winery' },
      image: '',
    },
    contact: {
      title: { ka: 'კონტაქტი', en: 'Contact' },
      subtitle: { ka: 'დაგვიკავშირდით', en: 'Get in touch' },
      email: 'tsabowinery@gmail.com',
      phone: '+995 599 615 438',
      whatsapp: '+995599615438',
      address: { ka: 'ზემო ხანდაკი, შიდა ქართლი, საქართველო', en: 'Zemo Khandaki, Shida Kartli, Georgia' },
    },
    footer: {
      copy: { ka: '© 2018 ცაბო. ყველა უფლება დაცულია.', en: '© 2018 TSABO. All rights reserved.' },
    },
  }

  export const DEFAULT_THEME: ThemeConfig = {
    colorWine: '#722F37',
    colorCharcoal: '#1a1a1a',
    colorCream: '#faf8f5',
    headingSize: 'lg',
    bodySize: 'md',
  }

  export const DEFAULT_VISIBILITY: SectionVisibility = {
    hero: true,
    wines: true,
    news: true,
    gallery: true,
    about: true,
    contact: true,
  }
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  Run: `npm run build`

  Expected: build succeeds with no type errors. If you see errors about missing `news` properties, double-check the `SiteContent` and `SectionVisibility` additions.

- [ ] **Step 4: Commit**

  ```bash
  git add src/features/tsabola/types/index.ts src/features/tsabola/content/site-content.ts
  git commit -m "feat: add NewsItem type and news defaults to SiteContent"
  ```

---

### Task 2: TsabolaNews Component + Page Wiring

**Files:**
- Create: `src/features/tsabola/components/tsabola-news.tsx`
- Create: `src/features/tsabola/components/__tests__/tsabola-news.test.tsx`
- Modify: `src/features/tsabola/components/tsabola-page.tsx`

**Interfaces:**
- Consumes: `DEFAULT_CONTENT.news` (Task 1), `DEFAULT_VISIBILITY.news` (Task 1), `useLang()` hook from `@/features/tsabola/hooks/use-lang`
- Produces: `TsabolaNews` component exported from `tsabola-news.tsx`

- [ ] **Step 1: Write the failing tests**

  Create `src/features/tsabola/components/__tests__/tsabola-news.test.tsx`:

  ```tsx
  import { render, screen } from '@testing-library/react'
  import { beforeEach, describe, expect, it } from 'vitest'

  import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'
  import { useContentStore } from '../../store/content-store'
  import { useLanguageStore } from '../../store/language-store'
  import { TsabolaNews } from '../tsabola-news'

  beforeEach(() => {
    useLanguageStore.setState({ lang: 'ka' })
    useContentStore.setState({ content: DEFAULT_CONTENT, theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY })
  })

  describe('TsabolaNews', () => {
    it('renders section title', () => {
      render(<TsabolaNews />)
      expect(screen.getByText('სიახლეები')).toBeInTheDocument()
    })

    it('renders all news item titles', () => {
      render(<TsabolaNews />)
      expect(screen.getByText('2024 ყვავება — ახალი მოსავალი')).toBeInTheDocument()
      expect(screen.getByText('სეზონური ფასდაკლება')).toBeInTheDocument()
    })

    it('renders item dates', () => {
      render(<TsabolaNews />)
      expect(screen.getByText('January 2025')).toBeInTheDocument()
      expect(screen.getByText('December 2024')).toBeInTheDocument()
    })

    it('renders placeholder when item has no image', () => {
      render(<TsabolaNews />)
      const placeholders = document.querySelectorAll('[data-placeholder="true"]')
      expect(placeholders.length).toBe(2)
    })

    it('renders img element when item has image path', () => {
      useContentStore.setState({
        content: {
          ...DEFAULT_CONTENT,
          news: {
            ...DEFAULT_CONTENT.news,
            items: [
              { ...DEFAULT_CONTENT.news.items[0], image: '/news/test.jpg' },
            ],
          },
        },
        theme: DEFAULT_THEME,
        visibility: DEFAULT_VISIBILITY,
      })
      render(<TsabolaNews />)
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('src', '/news/test.jpg')
    })
  })
  ```

- [ ] **Step 2: Run tests to verify they fail**

  Run: `npx vitest run src/features/tsabola/components/__tests__/tsabola-news.test.tsx`

  Expected: FAIL — "Cannot find module '../tsabola-news'"

- [ ] **Step 3: Create `src/features/tsabola/components/tsabola-news.tsx`**

  ```tsx
  'use client'

  import { useLang } from '../hooks/use-lang'

  export function TsabolaNews() {
    const { t, r } = useLang()

    return (
      <section id="news" className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-3">{r(t.news.subtitle)}</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal">{r(t.news.title)}</h2>
            <div className="w-12 h-0.5 bg-wine mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.news.items.map((item) => (
              <div key={item.id} className="border border-charcoal/10 rounded overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={r(item.title)} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      data-placeholder="true"
                      className="w-full h-full bg-gradient-to-br from-wine/15 via-cream to-charcoal/20"
                    />
                  )}
                </div>
                <div className="p-5 space-y-2">
                  <p className="text-xs uppercase tracking-widest text-wine/70">{item.date}</p>
                  <h3 className="font-display font-bold text-charcoal">{r(item.title)}</h3>
                  <p className="text-sm text-charcoal/70">{r(item.body)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  ```

- [ ] **Step 4: Run tests to verify they pass**

  Run: `npx vitest run src/features/tsabola/components/__tests__/tsabola-news.test.tsx`

  Expected: 5 tests PASS

- [ ] **Step 5: Wire `TsabolaNews` into `TsabolaPage`**

  In `src/features/tsabola/components/tsabola-page.tsx`, add the import and insert the component between Wines and Gallery:

  Add import (after the `TsabolaWineCatalog` import line):
  ```tsx
  import { TsabolaNews } from './tsabola-news'
  ```

  Update the JSX inside `<main>`:
  ```tsx
  <main>
    {visibility.hero && <TsabolaHero />}
    {visibility.about && <TsabolaAbout />}
    {visibility.wines && <TsabolaWineCatalog />}
    {visibility.news && <TsabolaNews />}
    {visibility.gallery && <TsabolaGallery />}
    {visibility.contact && <TsabolaContact />}
  </main>
  ```

- [ ] **Step 6: Verify build**

  Run: `npm run build`

  Expected: no errors.

- [ ] **Step 7: Commit**

  ```bash
  git add src/features/tsabola/components/tsabola-news.tsx src/features/tsabola/components/__tests__/tsabola-news.test.tsx src/features/tsabola/components/tsabola-page.tsx
  git commit -m "feat: add TsabolaNews component and wire into page"
  ```

---

### Task 3: NewsEditor + Admin Wiring

**Files:**
- Create: `src/features/tsabola/admin/editors/news-editor.tsx`
- Modify: `src/features/tsabola/admin/admin-sidebar.tsx`
- Modify: `src/features/tsabola/admin/admin-panel.tsx`
- Modify: `src/features/tsabola/admin/visibility-editor.tsx`

**Interfaces:**
- Consumes: `NewsItem` type (Task 1), `useContentStore` with `content.news` shape (Task 1), `BilingualField` from `./_bilingual-field`, `Button`/`Input`/`Label` from `@/shared/components/ui/`

- [ ] **Step 1: Create `src/features/tsabola/admin/editors/news-editor.tsx`**

  ```tsx
  'use client'

  import { useState } from 'react'

  import { useContentStore } from '@/features/tsabola/store/content-store'
  import type { NewsItem } from '@/features/tsabola/types'
  import { Button } from '@/shared/components/ui/button'
  import { Input } from '@/shared/components/ui/input'
  import { Label } from '@/shared/components/ui/label'

  import { BilingualField } from './_bilingual-field'

  const EMPTY_ITEM: NewsItem = {
    id: '',
    title: { ka: '', en: '' },
    date: '',
    body: { ka: '', en: '' },
    image: '',
  }

  export function NewsEditor() {
    const { content, updateSection } = useContentStore()
    const { news } = content
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const setItems = (items: NewsItem[]) => updateSection('news', { ...news, items })

    const updateItem = (index: number, item: NewsItem) => {
      const next = [...news.items]
      next[index] = item
      setItems(next)
    }

    const deleteItem = (index: number) => {
      setItems(news.items.filter((_, i) => i !== index))
    }

    const addItem = () => {
      const newItem: NewsItem = { ...EMPTY_ITEM, id: `news-${news.items.length + 1}` }
      setItems([...news.items, newItem])
      setExpandedId(newItem.id)
    }

    const moveItem = (index: number, dir: -1 | 1) => {
      const next = [...news.items]
      const target = index + dir
      if (target < 0 || target >= next.length) return
      ;[next[index], next[target]] = [next[target], next[index]]
      setItems(next)
    }

    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-charcoal">News</h2>
          <Button size="sm" onClick={addItem} className="bg-wine hover:bg-wine/90 text-white">
            + Add Item
          </Button>
        </div>

        <div className="space-y-4">
          <BilingualField
            label="Section Title"
            value={news.title}
            onChange={(v) => updateSection('news', { ...news, title: v })}
          />
          <BilingualField
            label="Section Subtitle"
            value={news.subtitle}
            onChange={(v) => updateSection('news', { ...news, subtitle: v })}
          />
        </div>

        {news.items.map((item, i) => (
          <div key={item.id} className="border border-border-wine rounded p-4 space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="font-medium text-charcoal hover:text-wine text-left"
              >
                {item.title.ka || item.title.en || `Item ${i + 1}`}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveItem(i, -1)}
                  disabled={i === 0}
                  className="text-xs px-2 py-1 border rounded hover:bg-cream disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveItem(i, 1)}
                  disabled={i === news.items.length - 1}
                  className="text-xs px-2 py-1 border rounded hover:bg-cream disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  onClick={() => deleteItem(i)}
                  className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>

            {expandedId === item.id && (
              <div className="space-y-4 pt-2 border-t border-border-wine">
                <BilingualField
                  label="Title"
                  value={item.title}
                  onChange={(v) => updateItem(i, { ...item, title: v })}
                />
                <BilingualField
                  label="Body"
                  value={item.body}
                  onChange={(v) => updateItem(i, { ...item, body: v })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-charcoal/70">Date (e.g. January 2025)</Label>
                    <Input
                      value={item.date}
                      onChange={(e) => updateItem(i, { ...item, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-charcoal/70">Image path</Label>
                    <Input
                      value={item.image}
                      onChange={(e) => updateItem(i, { ...item, image: e.target.value })}
                      placeholder="/news/item.jpg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }
  ```

- [ ] **Step 2: Add `news` to `AdminSidebar` CONTENT_SECTIONS**

  In `src/features/tsabola/admin/admin-sidebar.tsx`, change:

  ```ts
  const CONTENT_SECTIONS = ['site', 'hero', 'wines', 'gallery', 'about', 'contact', 'footer'] as const
  ```

  to:

  ```ts
  const CONTENT_SECTIONS = ['site', 'hero', 'wines', 'news', 'gallery', 'about', 'contact', 'footer'] as const
  ```

- [ ] **Step 3: Register `NewsEditor` in `AdminPanel`**

  In `src/features/tsabola/admin/admin-panel.tsx`, add the import after the `WinesEditor` import:

  ```tsx
  import { NewsEditor } from './editors/news-editor'
  ```

  Then add to `EDITOR_MAP` after `wines`:

  ```ts
  const EDITOR_MAP: Record<string, React.ComponentType> = {
    site: SiteEditor,
    hero: HeroEditor,
    wines: WinesEditor,
    news: NewsEditor,
    gallery: GalleryEditor,
    about: AboutEditor,
    contact: ContactEditor,
    footer: FooterEditor,
    theme: ThemeEditor,
    visibility: VisibilityEditor,
    export: ExportReset,
    reset: ExportReset,
  }
  ```

- [ ] **Step 4: Add `news` toggle to `VisibilityEditor`**

  In `src/features/tsabola/admin/visibility-editor.tsx`, change:

  ```ts
  const SECTIONS = [
    { key: 'hero', label: 'Hero' },
    { key: 'wines', label: 'Wine Catalog' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'about', label: 'About' },
    { key: 'contact', label: 'Contact' },
  ] as const
  ```

  to:

  ```ts
  const SECTIONS = [
    { key: 'hero', label: 'Hero' },
    { key: 'wines', label: 'Wine Catalog' },
    { key: 'news', label: 'News' },
    { key: 'gallery', label: 'Gallery' },
    { key: 'about', label: 'About' },
    { key: 'contact', label: 'Contact' },
  ] as const
  ```

- [ ] **Step 5: Run full test suite and build**

  Run: `npm run build && npm run test -- --run`

  Expected: build passes, all tests pass.

- [ ] **Step 6: Commit**

  ```bash
  git add src/features/tsabola/admin/editors/news-editor.tsx src/features/tsabola/admin/admin-sidebar.tsx src/features/tsabola/admin/admin-panel.tsx src/features/tsabola/admin/visibility-editor.tsx
  git commit -m "feat: add NewsEditor and wire into admin panel, sidebar, and visibility editor"
  ```
