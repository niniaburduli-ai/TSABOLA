# TSABOLA Wine Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium bilingual (KA/EN) single-page informational site for TSABOLA wine brand with a code-free admin panel for content, theme, and section visibility management.

**Architecture:** Two persisted Zustand stores (`languageStore`, `contentStore`) are the live CMS layer. `site-content.ts` seeds store defaults on first load. Public site reads stores; admin panel writes them. Theme CSS vars applied to `document.documentElement.style` via `useEffect` in `TsabolaPage`. All tsabola components are `'use client'`.

**Tech Stack:** Next.js 16 · Tailwind CSS 4 · shadcn/ui · Zustand 5 (persist) · Vitest + React Testing Library

## Global Constraints

- No new npm dependencies — all packages already in `package.json`
- Install missing shadcn components via `npx shadcn@latest add <name>` (no new packages)
- All text fields must be `{ ka: string; en: string }` — no hardcoded strings in components
- All TSABOLA feature components must have `'use client'` at top
- Tailwind color tokens added to `@theme inline`: `wine` (#722F37), `charcoal` (#1a1a1a), `cream` (#faf8f5)
- shadcn components live at `@/shared/components/ui/`
- Test command: `npm run test:run` (runs vitest in jsdom with RTL)
- Mobile-first, light mode only, no form submissions, no auth

---

## File Map

**Created:**
```
src/features/tsabola/types/index.ts
src/features/tsabola/content/site-content.ts
src/features/tsabola/store/language-store.ts
src/features/tsabola/store/content-store.ts
src/features/tsabola/hooks/use-lang.ts
src/features/tsabola/components/tsabola-page.tsx
src/features/tsabola/components/tsabola-header.tsx
src/features/tsabola/components/tsabola-hero.tsx
src/features/tsabola/components/tsabola-wine-card.tsx
src/features/tsabola/components/tsabola-wine-catalog.tsx
src/features/tsabola/components/tsabola-gallery.tsx
src/features/tsabola/components/tsabola-about.tsx
src/features/tsabola/components/tsabola-contact.tsx
src/features/tsabola/components/tsabola-footer.tsx
src/features/tsabola/admin/admin-panel.tsx
src/features/tsabola/admin/admin-sidebar.tsx
src/features/tsabola/admin/admin-header.tsx
src/features/tsabola/admin/theme-editor.tsx
src/features/tsabola/admin/visibility-editor.tsx
src/features/tsabola/admin/editors/site-editor.tsx
src/features/tsabola/admin/editors/hero-editor.tsx
src/features/tsabola/admin/editors/wines-editor.tsx
src/features/tsabola/admin/editors/gallery-editor.tsx
src/features/tsabola/admin/editors/about-editor.tsx
src/features/tsabola/admin/editors/contact-editor.tsx
src/features/tsabola/admin/editors/footer-editor.tsx
src/app/(admin)/admin/page.tsx
src/features/tsabola/store/__tests__/language-store.test.ts
src/features/tsabola/store/__tests__/content-store.test.ts
src/features/tsabola/hooks/__tests__/use-lang.test.tsx
src/features/tsabola/components/__tests__/tsabola-header.test.tsx
src/features/tsabola/components/__tests__/tsabola-wine-catalog.test.tsx
```

**Modified:**
```
src/app/globals.css           — add wine/charcoal/cream Tailwind tokens
src/app/layout.tsx            — add Playfair Display font variable
src/app/(public)/page.tsx     — replace marketing page with TsabolaPage
```

---

## PHASE 1 — Public Site

---

### Task 1: Foundation — Theme Tokens, Font, shadcn Components

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `font-display` CSS variable, `text-wine`/`bg-wine`/`text-charcoal`/`bg-cream`/`text-cream` Tailwind classes, `text-wine-border` border color

- [ ] **Step 1: Install missing shadcn components**

```bash
cd c:/Users/user/Desktop/TSABOLA
npx shadcn@latest add badge switch alert-dialog tabs select textarea
```

Expected: components added to `src/shared/components/ui/` (badge.tsx, switch.tsx, alert-dialog.tsx, tabs.tsx, select.tsx, textarea.tsx)

- [ ] **Step 2: Add wine theme tokens to `globals.css`**

In `src/app/globals.css`, inside the existing `@theme inline { ... }` block, add after the last `--radius-4xl` line:

```css
  --color-wine: #722F37;
  --color-charcoal: #1a1a1a;
  --color-cream: #faf8f5;
  --color-border-wine: #e8e0d8;
  --font-display: var(--font-display);
```

- [ ] **Step 3: Add Playfair Display to `layout.tsx`**

```tsx
import { Geist_Mono, Inter, Space_Grotesk, Playfair_Display } from 'next/font/google';

const playfairDisplay = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});
```

Then add `${playfairDisplay.variable}` to the `<html>` className string alongside the existing font variables.

- [ ] **Step 4: Verify tokens work**

Run dev server: `npm run dev`
Open browser, open DevTools → Elements → `<html>`. Confirm `--font-display` CSS variable is set. Confirm `class` contains `--font-display` variable reference.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/shared/components/ui/
git commit -m "feat: add TSABOLA theme tokens, Playfair Display font, shadcn components"
```

---

### Task 2: Types + Content Defaults

**Files:**
- Create: `src/features/tsabola/types/index.ts`
- Create: `src/features/tsabola/content/site-content.ts`

**Interfaces:**
- Produces: `L`, `SiteContent`, `WineItem`, `ThemeConfig`, `SectionVisibility` types; `DEFAULT_CONTENT`, `DEFAULT_THEME`, `DEFAULT_VISIBILITY` constants

- [ ] **Step 1: Create types file**

Create `src/features/tsabola/types/index.ts`:

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
```

- [ ] **Step 2: Create content defaults**

Create `src/features/tsabola/content/site-content.ts`:

```ts
import type { SiteContent, ThemeConfig, SectionVisibility } from '../types'

export const DEFAULT_CONTENT: SiteContent = {
  site: {
    name: { ka: 'ცაბოლა', en: 'TSABOLA' },
    slogan: { ka: 'კახეთის სული ბოთლში', en: 'The Soul of Kakheti in Every Bottle' },
  },
  nav: {
    wines: { ka: 'ღვინოები', en: 'Wines' },
    gallery: { ka: 'გალერეა', en: 'Gallery' },
    about: { ka: 'ჩვენ შესახებ', en: 'About' },
    contact: { ka: 'კონტაქტი', en: 'Contact' },
  },
  hero: {
    headline: { ka: 'კახეთის სულისკვეთება', en: 'The Spirit of Kakheti' },
    subline: {
      ka: 'ოჯახური მარნის ტრადიცია სამი თაობის განმავლობაში',
      en: 'A family winery tradition spanning three generations',
    },
    cta: { ka: 'ღვინოები აღმოაჩინე', en: 'Discover Our Wines' },
  },
  wines: [
    {
      id: 'rkatsiteli',
      name: { ka: 'რქაწითელი', en: 'Rkatsiteli' },
      type: { ka: 'ანბერი', en: 'Amber' },
      typeBadge: { ka: 'ანბერი', en: 'Amber' },
      price: '45₾',
      description: {
        ka: 'ქვევრში დავარგებული, ხაჭოზე ნამყოფი. კომშის და ყვავილის ნოტებით.',
        en: 'Qvevri-aged on skins. Notes of quince and dried flowers.',
      },
      image: '',
    },
    {
      id: 'saperavi',
      name: { ka: 'საფერავი', en: 'Saperavi' },
      type: { ka: 'წითელი', en: 'Red' },
      typeBadge: { ka: 'წითელი', en: 'Red' },
      price: '55₾',
      description: {
        ka: 'მუხის კასრში დავარგებული. მუქი კენკრა, შავი ალუბალი, ტყავი.',
        en: 'Oak-aged full body. Dark berry, black cherry, leather.',
      },
      image: '',
    },
    {
      id: 'mtsvane',
      name: { ka: 'მწვანე', en: 'Mtsvane' },
      type: { ka: 'თეთრი', en: 'White' },
      typeBadge: { ka: 'თეთრი', en: 'White' },
      price: '40₾',
      description: {
        ka: 'სუფთა, ყვავილოვანი. ატმის, ჟასმინის ნოტებით.',
        en: 'Crisp and floral. Hints of white peach and jasmine.',
      },
      image: '',
    },
    {
      id: 'rose',
      name: { ka: 'კახური როზე', en: 'Kakhuri Rosé' },
      type: { ka: 'როზე', en: 'Rosé' },
      typeBadge: { ka: 'როზე', en: 'Rosé' },
      price: '48₾',
      description: {
        ka: 'ნახევრად მშრალი. ზაფხულის კენკრა, ნარინჯი, სიახლე.',
        en: 'Semi-dry. Summer berries, orange zest, bright finish.',
      },
      image: '',
    },
  ],
  gallery: {
    title: { ka: 'გალერეა', en: 'Gallery' },
    subtitle: { ka: 'ვენახი, მარანი, ხელოვნება', en: 'Vineyard, Cellar, Craft' },
    images: ['', '', '', '', '', ''],
  },
  about: {
    title: { ka: 'ჩვენ შესახებ', en: 'Our Story' },
    body: {
      ka: 'ცაბოლა — ოჯახური სახელი, თაობების ერთგულება. კახეთის გულში, სამი თაობის განმავლობაში, ჩვენ ვაგრძელებთ ქართული ღვინის ტრადიციას ქვევრით, სიყვარულით და მიწის პატივისცემით.\n\nჩვენი ყოველი ბოთლი — ეს არის ხელნაკეთი ამბავი. მინიმალური ჩარევა, ბუნებრივი ვარდნა, ვენახიდან პირდაპირ მაგიდაზე.',
      en: 'TSABOLA is a family name and a promise of terroir. Rooted in the vineyards of Kakheti for three generations, we carry Georgian wine culture forward — one qvevri, one harvest, one story at a time.\n\nEach bottle is handcrafted with minimal intervention. Nature-first. From our vineyard to your table.',
    },
    imageAlt: { ka: 'ოჯახური მარანი', en: 'Family winery' },
    image: '',
  },
  contact: {
    title: { ka: 'კონტაქტი', en: 'Contact' },
    subtitle: { ka: 'დაგვიკავშირდით', en: 'Get in touch' },
    email: 'info@tsabola.ge',
    phone: '+995 555 000 000',
    address: { ka: 'კახეთი, საქართველო', en: 'Kakheti, Georgia' },
  },
  footer: {
    copy: { ka: '© 2024 ცაბოლა. ყველა უფლება დაცულია.', en: '© 2024 TSABOLA. All rights reserved.' },
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
  gallery: true,
  about: true,
  contact: true,
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/tsabola/
git commit -m "feat: add TSABOLA types and bilingual content defaults"
```

---

### Task 3: Zustand Stores

**Files:**
- Create: `src/features/tsabola/store/language-store.ts`
- Create: `src/features/tsabola/store/content-store.ts`
- Create: `src/features/tsabola/store/__tests__/language-store.test.ts`
- Create: `src/features/tsabola/store/__tests__/content-store.test.ts`

**Interfaces:**
- Consumes: `SiteContent`, `ThemeConfig`, `SectionVisibility` from `../types`; `DEFAULT_CONTENT`, `DEFAULT_THEME`, `DEFAULT_VISIBILITY` from `../content/site-content`
- Produces: `useLanguageStore()` → `{ lang, setLang }`, `useContentStore()` → `{ content, theme, visibility, setContent, updateSection, setTheme, setVisibility, resetToDefaults }`

- [ ] **Step 1: Write failing tests**

Create `src/features/tsabola/store/__tests__/language-store.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useLanguageStore } from '../language-store'

beforeEach(() => {
  useLanguageStore.setState({ lang: 'ka' })
})

describe('languageStore', () => {
  it('defaults to ka', () => {
    expect(useLanguageStore.getState().lang).toBe('ka')
  })

  it('setLang switches to en', () => {
    useLanguageStore.getState().setLang('en')
    expect(useLanguageStore.getState().lang).toBe('en')
  })

  it('setLang switches back to ka', () => {
    useLanguageStore.getState().setLang('en')
    useLanguageStore.getState().setLang('ka')
    expect(useLanguageStore.getState().lang).toBe('ka')
  })
})
```

Create `src/features/tsabola/store/__tests__/content-store.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useContentStore } from '../content-store'
import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'

beforeEach(() => {
  useContentStore.setState({
    content: DEFAULT_CONTENT,
    theme: DEFAULT_THEME,
    visibility: DEFAULT_VISIBILITY,
  })
})

describe('contentStore', () => {
  it('initializes with default content', () => {
    expect(useContentStore.getState().content.site.name.ka).toBe('ცაბოლა')
  })

  it('updateSection updates a top-level key', () => {
    const newSite = { name: { ka: 'ახალი', en: 'New' }, slogan: { ka: 'ა', en: 'b' } }
    useContentStore.getState().updateSection('site', newSite)
    expect(useContentStore.getState().content.site.name.ka).toBe('ახალი')
  })

  it('setTheme updates theme config', () => {
    useContentStore.getState().setTheme({ ...DEFAULT_THEME, colorWine: '#FF0000' })
    expect(useContentStore.getState().theme.colorWine).toBe('#FF0000')
  })

  it('setVisibility toggles section', () => {
    useContentStore.getState().setVisibility({ ...DEFAULT_VISIBILITY, hero: false })
    expect(useContentStore.getState().visibility.hero).toBe(false)
  })

  it('resetToDefaults restores defaults', () => {
    useContentStore.getState().setTheme({ ...DEFAULT_THEME, colorWine: '#FF0000' })
    useContentStore.getState().resetToDefaults()
    expect(useContentStore.getState().theme.colorWine).toBe('#722F37')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm run test:run -- src/features/tsabola/store/__tests__/
```

Expected: `Error: Cannot find module '../language-store'`

- [ ] **Step 3: Create `language-store.ts`**

Create `src/features/tsabola/store/language-store.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LanguageStore {
  lang: 'ka' | 'en'
  setLang: (lang: 'ka' | 'en') => void
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      lang: 'ka',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'tsabola-lang' }
  )
)
```

- [ ] **Step 4: Create `content-store.ts`**

Create `src/features/tsabola/store/content-store.ts`:

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../content/site-content'
import type { SiteContent, ThemeConfig, SectionVisibility } from '../types'

interface ContentStore {
  content: SiteContent
  theme: ThemeConfig
  visibility: SectionVisibility
  setContent: (c: SiteContent) => void
  updateSection: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void
  setTheme: (t: ThemeConfig) => void
  setVisibility: (v: SectionVisibility) => void
  resetToDefaults: () => void
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set) => ({
      content: DEFAULT_CONTENT,
      theme: DEFAULT_THEME,
      visibility: DEFAULT_VISIBILITY,
      setContent: (content) => set({ content }),
      updateSection: (key, value) =>
        set((state) => ({ content: { ...state.content, [key]: value } })),
      setTheme: (theme) => set({ theme }),
      setVisibility: (visibility) => set({ visibility }),
      resetToDefaults: () =>
        set({ content: DEFAULT_CONTENT, theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY }),
    }),
    { name: 'tsabola-content' }
  )
)
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm run test:run -- src/features/tsabola/store/__tests__/
```

Expected: `✓ languageStore > defaults to ka`, `✓ contentStore > initializes with default content` (all 8 tests pass)

- [ ] **Step 6: Commit**

```bash
git add src/features/tsabola/store/
git commit -m "feat: add TSABOLA language and content Zustand stores"
```

---

### Task 4: `useLang` Hook

**Files:**
- Create: `src/features/tsabola/hooks/use-lang.ts`
- Create: `src/features/tsabola/hooks/__tests__/use-lang.test.tsx`

**Interfaces:**
- Consumes: `useLanguageStore`, `useContentStore`
- Produces: `useLang()` → `{ t: SiteContent, theme: ThemeConfig, visibility: SectionVisibility, lang: 'ka'|'en', setLang, r: (field: L) => string }`; standalone `r(field: L, lang: 'ka'|'en'): string`

- [ ] **Step 1: Write failing test**

Create `src/features/tsabola/hooks/__tests__/use-lang.test.tsx`:

```tsx
import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useLang, r } from '../use-lang'
import { useLanguageStore } from '../../store/language-store'
import { useContentStore } from '../../store/content-store'
import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'

beforeEach(() => {
  useLanguageStore.setState({ lang: 'ka' })
  useContentStore.setState({ content: DEFAULT_CONTENT, theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY })
})

describe('r()', () => {
  it('returns ka string when lang is ka', () => {
    expect(r({ ka: 'ღვინო', en: 'Wine' }, 'ka')).toBe('ღვინო')
  })
  it('returns en string when lang is en', () => {
    expect(r({ ka: 'ღვინო', en: 'Wine' }, 'en')).toBe('Wine')
  })
})

describe('useLang()', () => {
  it('r() partial resolves to ka by default', () => {
    const { result } = renderHook(() => useLang())
    expect(result.current.r({ ka: 'ცაბოლა', en: 'TSABOLA' })).toBe('ცაბოლა')
  })

  it('r() resolves to en after setLang en', () => {
    const { result } = renderHook(() => useLang())
    act(() => result.current.setLang('en'))
    expect(result.current.r({ ka: 'ცაბოლა', en: 'TSABOLA' })).toBe('TSABOLA')
  })

  it('t.site.name.ka is correct', () => {
    const { result } = renderHook(() => useLang())
    expect(result.current.t.site.name.ka).toBe('ცაბოლა')
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:run -- src/features/tsabola/hooks/__tests__/
```

Expected: `Cannot find module '../use-lang'`

- [ ] **Step 3: Create `use-lang.ts`**

Create `src/features/tsabola/hooks/use-lang.ts`:

```ts
import { useLanguageStore } from '../store/language-store'
import { useContentStore } from '../store/content-store'
import type { L } from '../types'

export function r(field: L, lang: 'ka' | 'en'): string {
  return field[lang]
}

export function useLang() {
  const { lang, setLang } = useLanguageStore()
  const { content, theme, visibility } = useContentStore()
  return {
    t: content,
    theme,
    visibility,
    lang,
    setLang,
    r: (field: L) => r(field, lang),
  }
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm run test:run -- src/features/tsabola/hooks/__tests__/
```

Expected: all 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/features/tsabola/hooks/
git commit -m "feat: add useLang hook and r() bilingual resolver"
```

---

### Task 5: Header Component

**Files:**
- Create: `src/features/tsabola/components/tsabola-header.tsx`
- Create: `src/features/tsabola/components/__tests__/tsabola-header.test.tsx`

**Interfaces:**
- Consumes: `useLang()` from `../hooks/use-lang`
- Produces: `<TsabolaHeader />` — sticky header with logo, nav, KA/EN switcher

- [ ] **Step 1: Write failing test**

Create `src/features/tsabola/components/__tests__/tsabola-header.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { TsabolaHeader } from '../tsabola-header'
import { useLanguageStore } from '../../store/language-store'
import { useContentStore } from '../../store/content-store'
import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'

beforeEach(() => {
  useLanguageStore.setState({ lang: 'ka' })
  useContentStore.setState({ content: DEFAULT_CONTENT, theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY })
})

describe('TsabolaHeader', () => {
  it('renders site name in ka', () => {
    render(<TsabolaHeader />)
    expect(screen.getByText('ცაბოლა')).toBeInTheDocument()
  })

  it('renders KA and EN buttons', () => {
    render(<TsabolaHeader />)
    expect(screen.getByRole('button', { name: 'KA' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()
  })

  it('clicking EN switches language', () => {
    render(<TsabolaHeader />)
    fireEvent.click(screen.getByRole('button', { name: 'EN' }))
    expect(useLanguageStore.getState().lang).toBe('en')
  })

  it('renders nav links', () => {
    render(<TsabolaHeader />)
    expect(screen.getByText('ღვინოები')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:run -- src/features/tsabola/components/__tests__/tsabola-header.test.tsx
```

Expected: `Cannot find module '../tsabola-header'`

- [ ] **Step 3: Create `tsabola-header.tsx`**

Create `src/features/tsabola/components/tsabola-header.tsx`:

```tsx
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
            className={`px-2 py-1 rounded transition-colors ${lang === 'ka' ? 'text-wine' : 'text-charcoal/40 hover:text-charcoal'}`}
          >
            KA
          </button>
          <span className="text-charcoal/20">/</span>
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-1 rounded transition-colors ${lang === 'en' ? 'text-wine' : 'text-charcoal/40 hover:text-charcoal'}`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run — expect PASS**

```bash
npm run test:run -- src/features/tsabola/components/__tests__/tsabola-header.test.tsx
```

Expected: all 4 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/features/tsabola/components/tsabola-header.tsx src/features/tsabola/components/__tests__/tsabola-header.test.tsx
git commit -m "feat: add TsabolaHeader with KA/EN switcher"
```

---

### Task 6: Hero Component

**Files:**
- Create: `src/features/tsabola/components/tsabola-hero.tsx`

**Interfaces:**
- Consumes: `useLang()`
- Produces: `<TsabolaHero />` — full-viewport hero with headline, subline, CTA

- [ ] **Step 1: Create `tsabola-hero.tsx`**

```tsx
'use client'

import { useLang } from '../hooks/use-lang'

export function TsabolaHero() {
  const { t, r } = useLang()

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-charcoal"
    >
      {/* Placeholder background */}
      <div
        data-placeholder="true"
        className="absolute inset-0 bg-gradient-to-br from-wine/30 via-charcoal to-charcoal/95"
      />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="w-16 h-px bg-wine mx-auto mb-8" />
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
          {r(t.hero.headline)}
        </h1>
        <div className="w-24 h-0.5 bg-wine mx-auto my-8" />
        <p className="text-cream/80 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
          {r(t.hero.subline)}
        </p>
        <a
          href="#wines"
          className="inline-block mt-10 px-8 py-3 border border-wine text-cream text-sm font-medium tracking-widest uppercase hover:bg-wine hover:text-white transition-colors duration-300"
        >
          {r(t.hero.cta)}
        </a>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/tsabola/components/tsabola-hero.tsx
git commit -m "feat: add TsabolaHero full-viewport section"
```

---

### Task 7: Wine Card + Wine Catalog

**Files:**
- Create: `src/features/tsabola/components/tsabola-wine-card.tsx`
- Create: `src/features/tsabola/components/tsabola-wine-catalog.tsx`
- Create: `src/features/tsabola/components/__tests__/tsabola-wine-catalog.test.tsx`

**Interfaces:**
- Consumes: `WineItem` from `../types`; `useLang()`
- Produces: `<TsabolaWineCard item={WineItem} />`, `<TsabolaWineCatalog />`

- [ ] **Step 1: Write failing test**

Create `src/features/tsabola/components/__tests__/tsabola-wine-catalog.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { TsabolaWineCatalog } from '../tsabola-wine-catalog'
import { useLanguageStore } from '../../store/language-store'
import { useContentStore } from '../../store/content-store'
import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'

beforeEach(() => {
  useLanguageStore.setState({ lang: 'ka' })
  useContentStore.setState({ content: DEFAULT_CONTENT, theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY })
})

describe('TsabolaWineCatalog', () => {
  it('renders all 4 wines', () => {
    render(<TsabolaWineCatalog />)
    expect(screen.getByText('რქაწითელი')).toBeInTheDocument()
    expect(screen.getByText('საფერავი')).toBeInTheDocument()
    expect(screen.getByText('მწვანე')).toBeInTheDocument()
    expect(screen.getByText('კახური როზე')).toBeInTheDocument()
  })

  it('renders prices', () => {
    render(<TsabolaWineCatalog />)
    expect(screen.getByText('45₾')).toBeInTheDocument()
    expect(screen.getByText('55₾')).toBeInTheDocument()
  })

  it('renders type badges in ka', () => {
    render(<TsabolaWineCatalog />)
    expect(screen.getByText('ანბერი')).toBeInTheDocument()
    expect(screen.getByText('წითელი')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test:run -- src/features/tsabola/components/__tests__/tsabola-wine-catalog.test.tsx
```

Expected: `Cannot find module '../tsabola-wine-catalog'`

- [ ] **Step 3: Create `tsabola-wine-card.tsx`**

```tsx
'use client'

import { r } from '../hooks/use-lang'
import type { WineItem } from '../types'

interface Props {
  item: WineItem
  lang: 'ka' | 'en'
}

export function TsabolaWineCard({ item, lang }: Props) {
  return (
    <article className="group flex flex-col bg-white border border-border-wine hover:border-wine/60 transition-colors duration-300">
      {/* Image */}
      {item.image ? (
        <img src={item.image} alt={r(item.name, lang)} className="w-full aspect-[4/3] object-cover" />
      ) : (
        <div
          data-placeholder="true"
          className="w-full aspect-[4/3] bg-gradient-to-br from-wine/10 via-cream to-charcoal/10"
        />
      )}

      <div className="p-6 flex flex-col gap-3 flex-1">
        <span className="inline-block self-start px-2.5 py-0.5 text-xs font-semibold tracking-widest uppercase border border-wine/40 text-wine">
          {r(item.typeBadge, lang)}
        </span>
        <h3 className="font-display text-2xl font-bold text-charcoal">{r(item.name, lang)}</h3>
        <p className="text-sm text-charcoal/60 leading-relaxed flex-1">{r(item.description, lang)}</p>
        <p className="font-heading text-xl font-bold text-wine mt-auto">{item.price}</p>
      </div>
    </article>
  )
}
```

- [ ] **Step 4: Create `tsabola-wine-catalog.tsx`**

```tsx
'use client'

import { useLang } from '../hooks/use-lang'
import { TsabolaWineCard } from './tsabola-wine-card'

export function TsabolaWineCatalog() {
  const { t, lang, r } = useLang()

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
            <TsabolaWineCard key={wine.id} item={wine} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Run — expect PASS**

```bash
npm run test:run -- src/features/tsabola/components/__tests__/tsabola-wine-catalog.test.tsx
```

Expected: all 3 tests pass

- [ ] **Step 6: Commit**

```bash
git add src/features/tsabola/components/tsabola-wine-card.tsx src/features/tsabola/components/tsabola-wine-catalog.tsx src/features/tsabola/components/__tests__/tsabola-wine-catalog.test.tsx
git commit -m "feat: add TsabolaWineCard and TsabolaWineCatalog"
```

---

### Task 8: Gallery, About, Contact, Footer Components

**Files:**
- Create: `src/features/tsabola/components/tsabola-gallery.tsx`
- Create: `src/features/tsabola/components/tsabola-about.tsx`
- Create: `src/features/tsabola/components/tsabola-contact.tsx`
- Create: `src/features/tsabola/components/tsabola-footer.tsx`

**Interfaces:**
- All consume `useLang()`
- Produces: `<TsabolaGallery />`, `<TsabolaAbout />`, `<TsabolaContact />`, `<TsabolaFooter />`

- [ ] **Step 1: Create `tsabola-gallery.tsx`**

```tsx
'use client'

import { useLang } from '../hooks/use-lang'

export function TsabolaGallery() {
  const { t, r } = useLang()

  return (
    <section id="gallery" className="bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-3">{r(t.gallery.subtitle)}</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal">{r(t.gallery.title)}</h2>
          <div className="w-12 h-0.5 bg-wine mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.gallery.images.map((src, i) => (
            <div key={i} className="relative group overflow-hidden aspect-square">
              {src ? (
                <img src={src} alt="" className="w-full h-full object-cover" />
              ) : (
                <div
                  data-placeholder="true"
                  className="w-full h-full bg-gradient-to-br from-wine/15 via-cream to-charcoal/20"
                />
              )}
              <div className="absolute inset-0 bg-wine/0 group-hover:bg-wine/20 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `tsabola-about.tsx`**

```tsx
'use client'

import { useLang } from '../hooks/use-lang'

export function TsabolaAbout() {
  const { t, r } = useLang()
  const paragraphs = r(t.about.body).split('\n\n').filter(Boolean)

  return (
    <section id="about" className="bg-cream py-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-6">
            {r(t.nav.about)}
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal mb-8">
            {r(t.about.title)}
          </h2>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`text-charcoal/70 leading-relaxed mb-4 ${i === 0 ? 'border-l-2 border-wine pl-4' : ''}`}
            >
              {p}
            </p>
          ))}
        </div>

        <div className="aspect-[3/4] overflow-hidden">
          {t.about.image ? (
            <img
              src={t.about.image}
              alt={r(t.about.imageAlt)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              data-placeholder="true"
              className="w-full h-full bg-gradient-to-b from-wine/20 via-charcoal/10 to-charcoal/30"
            />
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `tsabola-contact.tsx`**

```tsx
'use client'

import { Mail, Phone, MapPin } from 'lucide-react'
import { useLang } from '../hooks/use-lang'

export function TsabolaContact() {
  const { t, r } = useLang()

  return (
    <section id="contact" className="bg-white py-24 px-6">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-wine/70 mb-3">
          {r(t.contact.subtitle)}
        </p>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal mb-8">
          {r(t.contact.title)}
        </h2>
        <div className="w-12 h-0.5 bg-wine mx-auto mb-12" />

        <div className="flex flex-col gap-6">
          <a href={`mailto:${t.contact.email}`} className="flex items-center gap-3 justify-center text-charcoal/70 hover:text-wine transition-colors">
            <Mail className="size-4 text-wine flex-shrink-0" />
            <span>{t.contact.email}</span>
          </a>
          <a href={`tel:${t.contact.phone}`} className="flex items-center gap-3 justify-center text-charcoal/70 hover:text-wine transition-colors">
            <Phone className="size-4 text-wine flex-shrink-0" />
            <span>{t.contact.phone}</span>
          </a>
          <div className="flex items-center gap-3 justify-center text-charcoal/70">
            <MapPin className="size-4 text-wine flex-shrink-0" />
            <span>{r(t.contact.address)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create `tsabola-footer.tsx`**

```tsx
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
```

- [ ] **Step 5: Commit**

```bash
git add src/features/tsabola/components/tsabola-gallery.tsx src/features/tsabola/components/tsabola-about.tsx src/features/tsabola/components/tsabola-contact.tsx src/features/tsabola/components/tsabola-footer.tsx
git commit -m "feat: add Gallery, About, Contact, Footer TSABOLA components"
```

---

### Task 9: TsabolaPage Assembler + Route Wiring

**Files:**
- Create: `src/features/tsabola/components/tsabola-page.tsx`
- Modify: `src/app/(public)/page.tsx`

**Interfaces:**
- Consumes: all section components, `useLang()`, `useContentStore()`
- Produces: `<TsabolaPage />` — assembles all sections, applies theme CSS vars, sets `document.lang`

- [ ] **Step 1: Create `tsabola-page.tsx`**

```tsx
'use client'

import { useEffect } from 'react'
import { useLang } from '../hooks/use-lang'
import { TsabolaHeader } from './tsabola-header'
import { TsabolaHero } from './tsabola-hero'
import { TsabolaWineCatalog } from './tsabola-wine-catalog'
import { TsabolaGallery } from './tsabola-gallery'
import { TsabolaAbout } from './tsabola-about'
import { TsabolaContact } from './tsabola-contact'
import { TsabolaFooter } from './tsabola-footer'

export function TsabolaPage() {
  const { lang, theme, visibility } = useLang()

  // Sync html lang attribute
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Apply theme CSS vars
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--wine', theme.colorWine)
    root.style.setProperty('--charcoal', theme.colorCharcoal)
    root.style.setProperty('--cream', theme.colorCream)
  }, [theme])

  return (
    <div className="flex flex-col min-h-screen">
      <TsabolaHeader />
      <main>
        {visibility.hero && <TsabolaHero />}
        {visibility.wines && <TsabolaWineCatalog />}
        {visibility.gallery && <TsabolaGallery />}
        {visibility.about && <TsabolaAbout />}
        {visibility.contact && <TsabolaContact />}
      </main>
      <TsabolaFooter />
    </div>
  )
}
```

- [ ] **Step 2: Update `src/app/(public)/page.tsx`**

Replace the entire file:

```tsx
import { TsabolaPage } from '@/features/tsabola/components/tsabola-page'

export default function HomePage() {
  return <TsabolaPage />
}
```

- [ ] **Step 3: Run dev server and visually verify**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- Header with `ცაბოლა` logo and `KA / EN` switcher visible
- Hero section with Georgian headline
- 4 wine cards in 2×2 grid
- 6 gallery placeholder tiles
- About section with wine-red left-border paragraph
- Contact with icons
- Dark footer
- Clicking `EN` instantly translates all text without reload
- Language persists after page refresh

- [ ] **Step 4: Run all tests**

```bash
npm run test:run
```

Expected: all tests pass (no regressions)

- [ ] **Step 5: Commit**

```bash
git add src/features/tsabola/components/tsabola-page.tsx src/app/(public)/page.tsx
git commit -m "feat: wire TsabolaPage as homepage, apply theme and lang to DOM"
```

---

## PHASE 2 — Admin Panel

---

### Task 10: Admin Layout (Panel, Sidebar, Header) + Route

**Files:**
- Create: `src/features/tsabola/admin/admin-panel.tsx`
- Create: `src/features/tsabola/admin/admin-sidebar.tsx`
- Create: `src/features/tsabola/admin/admin-header.tsx`
- Create: `src/app/(admin)/admin/page.tsx`

**Interfaces:**
- Consumes: `useContentStore()`
- Produces: `<AdminPanel />` with sidebar navigation and content slot

- [ ] **Step 1: Create `admin-sidebar.tsx`**

```tsx
'use client'

interface Props {
  active: string
  onSelect: (section: string) => void
}

const CONTENT_SECTIONS = ['site', 'hero', 'wines', 'gallery', 'about', 'contact', 'footer'] as const
const APPEARANCE_SECTIONS = ['theme', 'visibility'] as const

export function AdminSidebar({ active, onSelect }: Props) {
  const linkClass = (key: string) =>
    `w-full text-left px-3 py-2 rounded text-sm transition-colors ${
      active === key ? 'bg-wine/10 text-wine font-medium' : 'text-charcoal/70 hover:bg-charcoal/5'
    }`

  return (
    <aside className="w-60 flex-shrink-0 border-r border-border-wine bg-cream h-full overflow-y-auto">
      <div className="p-4">
        <p className="text-xs font-bold tracking-widest uppercase text-charcoal/40 mb-2 px-3">Content</p>
        {CONTENT_SECTIONS.map((s) => (
          <button key={s} onClick={() => onSelect(s)} className={linkClass(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        <p className="text-xs font-bold tracking-widest uppercase text-charcoal/40 mb-2 px-3 mt-6">Appearance</p>
        {APPEARANCE_SECTIONS.map((s) => (
          <button key={s} onClick={() => onSelect(s)} className={linkClass(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        <div className="mt-6 border-t border-border-wine pt-4">
          <p className="text-xs font-bold tracking-widest uppercase text-charcoal/40 mb-2 px-3">Actions</p>
          <button onClick={() => onSelect('export')} className={linkClass('export')}>
            Export JSON
          </button>
          <button onClick={() => onSelect('reset')} className={linkClass('reset')}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create `admin-header.tsx`**

```tsx
'use client'

export function AdminHeader() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-800 font-medium flex items-center justify-between">
      <span>⚠ Local development — no authentication</span>
      <a href="/" className="underline hover:text-amber-900">
        ← Back to site
      </a>
    </div>
  )
}
```

- [ ] **Step 3: Create `admin-panel.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { AdminSidebar } from './admin-sidebar'
import { AdminHeader } from './admin-header'
import { SiteEditor } from './editors/site-editor'
import { HeroEditor } from './editors/hero-editor'
import { WinesEditor } from './editors/wines-editor'
import { GalleryEditor } from './editors/gallery-editor'
import { AboutEditor } from './editors/about-editor'
import { ContactEditor } from './editors/contact-editor'
import { FooterEditor } from './editors/footer-editor'
import { ThemeEditor } from './theme-editor'
import { VisibilityEditor } from './visibility-editor'
import { ExportReset } from './export-reset'

const EDITOR_MAP: Record<string, React.ComponentType> = {
  site: SiteEditor,
  hero: HeroEditor,
  wines: WinesEditor,
  gallery: GalleryEditor,
  about: AboutEditor,
  contact: ContactEditor,
  footer: FooterEditor,
  theme: ThemeEditor,
  visibility: VisibilityEditor,
  export: ExportReset,
  reset: ExportReset,
}

export function AdminPanel() {
  const [active, setActive] = useState('site')
  const Editor = EDITOR_MAP[active] ?? SiteEditor

  return (
    <div className="flex flex-col h-screen bg-white">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar active={active} onSelect={setActive} />
        <main className="flex-1 overflow-y-auto p-8">
          <Editor />
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create stub `src/features/tsabola/admin/export-reset.tsx`** (full impl in Task 15)

```tsx
'use client'
export function ExportReset() {
  return <div className="p-4 text-sm text-charcoal/50">Export / Reset — implemented in Task 15</div>
}
```

- [ ] **Step 5: Create route `src/app/(admin)/admin/page.tsx`**

```tsx
import { AdminPanel } from '@/features/tsabola/admin/admin-panel'

export default function AdminPage() {
  return <AdminPanel />
}
```

- [ ] **Step 6: Verify admin route loads**

With `npm run dev` running, open `http://localhost:3000/admin`.
Expected: admin header with "Local development" banner, sidebar with section links, empty content area.

- [ ] **Step 6: Commit**

```bash
git add src/features/tsabola/admin/ src/app/(admin)/
git commit -m "feat: add admin panel layout, sidebar, and route at /admin"
```

---

### Task 11: Content Editors — Site, Hero, Footer

**Files:**
- Create: `src/features/tsabola/admin/editors/site-editor.tsx`
- Create: `src/features/tsabola/admin/editors/hero-editor.tsx`
- Create: `src/features/tsabola/admin/editors/footer-editor.tsx`

**Interfaces:**
- Consumes: `useContentStore()`
- Produces: Three editor components with KA/EN tabs for bilingual fields

A shared helper component is used across all editors:

- [ ] **Step 1: Create `src/features/tsabola/admin/editors/_bilingal-field.tsx`** (shared)

```tsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import type { L } from '../../types'

interface Props {
  label: string
  value: L
  onChange: (val: L) => void
  multiline?: boolean
}

export function BilingualField({ label, value, onChange, multiline }: Props) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-charcoal/70">{label}</Label>
      <Tabs defaultValue="ka">
        <TabsList className="h-8">
          <TabsTrigger value="ka" className="text-xs">KA</TabsTrigger>
          <TabsTrigger value="en" className="text-xs">EN</TabsTrigger>
        </TabsList>
        {(['ka', 'en'] as const).map((lang) => (
          <TabsContent key={lang} value={lang}>
            <Input
              value={value[lang]}
              onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
              className="w-full"
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Create `site-editor.tsx`**

```tsx
'use client'

import { useContentStore } from '../../store/content-store'
import { BilingualField } from './_bilingal-field'

export function SiteEditor() {
  const { content, updateSection } = useContentStore()

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Site Info</h2>
      <BilingualField
        label="Site Name"
        value={content.site.name}
        onChange={(val) => updateSection('site', { ...content.site, name: val })}
      />
      <BilingualField
        label="Slogan"
        value={content.site.slogan}
        onChange={(val) => updateSection('site', { ...content.site, slogan: val })}
      />

      <div className="pt-4 border-t border-border-wine">
        <p className="text-sm font-semibold text-charcoal mb-4">Navigation Labels</p>
        {(['wines', 'gallery', 'about', 'contact'] as const).map((key) => (
          <BilingualField
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            value={content.nav[key]}
            onChange={(val) => updateSection('nav', { ...content.nav, [key]: val })}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `hero-editor.tsx`**

```tsx
'use client'

import { useContentStore } from '../../store/content-store'
import { BilingualField } from './_bilingal-field'

export function HeroEditor() {
  const { content, updateSection } = useContentStore()
  const { hero } = content

  const update = (key: keyof typeof hero) => (val: typeof hero[typeof key]) =>
    updateSection('hero', { ...hero, [key]: val })

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Hero</h2>
      <BilingualField label="Headline" value={hero.headline} onChange={update('headline')} />
      <BilingualField label="Subline" value={hero.subline} onChange={update('subline')} />
      <BilingualField label="CTA Button" value={hero.cta} onChange={update('cta')} />
    </div>
  )
}
```

- [ ] **Step 4: Create `footer-editor.tsx`**

```tsx
'use client'

import { useContentStore } from '../../store/content-store'
import { BilingualField } from './_bilingal-field'

export function FooterEditor() {
  const { content, updateSection } = useContentStore()

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Footer</h2>
      <BilingualField
        label="Copyright Text"
        value={content.footer.copy}
        onChange={(val) => updateSection('footer', { copy: val })}
      />
    </div>
  )
}
```

- [ ] **Step 5: Verify in browser**

Open `http://localhost:3000/admin`. Click "Site" in sidebar. Edit the site name KA tab. Switch to public site — name should update instantly.

- [ ] **Step 6: Commit**

```bash
git add src/features/tsabola/admin/editors/
git commit -m "feat: add Site, Hero, Footer content editors with KA/EN tabs"
```

---

### Task 12: Wines Editor

**Files:**
- Create: `src/features/tsabola/admin/editors/wines-editor.tsx`

**Interfaces:**
- Consumes: `useContentStore()` — `content.wines`, `updateSection('wines', ...)`
- Produces: `<WinesEditor />` — list of wines with edit/delete/add/reorder

- [ ] **Step 1: Create `wines-editor.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useContentStore } from '../../store/content-store'
import { BilingualField } from './_bilingal-field'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import type { WineItem } from '../../types'

const EMPTY_WINE: WineItem = {
  id: '',
  name: { ka: '', en: '' },
  type: { ka: '', en: '' },
  typeBadge: { ka: '', en: '' },
  price: '',
  description: { ka: '', en: '' },
  image: '',
}

export function WinesEditor() {
  const { content, updateSection } = useContentStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const setWines = (wines: WineItem[]) => updateSection('wines', wines)

  const updateWine = (index: number, wine: WineItem) => {
    const next = [...content.wines]
    next[index] = wine
    setWines(next)
  }

  const deleteWine = (index: number) => {
    setWines(content.wines.filter((_, i) => i !== index))
  }

  const addWine = () => {
    const newWine = { ...EMPTY_WINE, id: `wine-${Date.now()}` }
    setWines([...content.wines, newWine])
    setExpandedId(newWine.id)
  }

  const moveWine = (index: number, dir: -1 | 1) => {
    const next = [...content.wines]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setWines(next)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-charcoal">Wines</h2>
        <Button size="sm" onClick={addWine} className="bg-wine hover:bg-wine/90 text-white">
          + Add Wine
        </Button>
      </div>

      {content.wines.map((wine, i) => (
        <div key={wine.id} className="border border-border-wine rounded p-4 space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setExpandedId(expandedId === wine.id ? null : wine.id)}
              className="font-medium text-charcoal hover:text-wine"
            >
              {wine.name.ka || wine.name.en || `Wine ${i + 1}`}
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => moveWine(i, -1)} className="text-xs px-2 py-1 border rounded hover:bg-cream" disabled={i === 0}>↑</button>
              <button onClick={() => moveWine(i, 1)} className="text-xs px-2 py-1 border rounded hover:bg-cream" disabled={i === content.wines.length - 1}>↓</button>
              <button onClick={() => deleteWine(i)} className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50">Delete</button>
            </div>
          </div>

          {expandedId === wine.id && (
            <div className="space-y-4 pt-2 border-t border-border-wine">
              <BilingualField label="Name" value={wine.name} onChange={(v) => updateWine(i, { ...wine, name: v })} />
              <BilingualField label="Type" value={wine.type} onChange={(v) => updateWine(i, { ...wine, type: v, typeBadge: v })} />
              <BilingualField label="Description" value={wine.description} onChange={(v) => updateWine(i, { ...wine, description: v })} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-charcoal/70">Price (e.g. 45₾)</Label>
                  <Input value={wine.price} onChange={(e) => updateWine(i, { ...wine, price: e.target.value })} />
                </div>
                <div>
                  <Label className="text-sm text-charcoal/70">Image path</Label>
                  <Input value={wine.image} onChange={(e) => updateWine(i, { ...wine, image: e.target.value })} placeholder="/wines/name.jpg" />
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

- [ ] **Step 2: Verify in browser**

Open `/admin` → Wines. Expand a wine card. Edit the KA name. Switch to public site — wine name updates instantly.
Add a wine. Delete a wine. Use up/down arrows to reorder.

- [ ] **Step 3: Commit**

```bash
git add src/features/tsabola/admin/editors/wines-editor.tsx
git commit -m "feat: add WinesEditor with add/edit/delete/reorder"
```

---

### Task 13: Gallery, About, Contact Editors

**Files:**
- Create: `src/features/tsabola/admin/editors/gallery-editor.tsx`
- Create: `src/features/tsabola/admin/editors/about-editor.tsx`
- Create: `src/features/tsabola/admin/editors/contact-editor.tsx`

- [ ] **Step 1: Create `gallery-editor.tsx`**

```tsx
'use client'

import { useContentStore } from '../../store/content-store'
import { BilingualField } from './_bilingal-field'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

export function GalleryEditor() {
  const { content, updateSection } = useContentStore()
  const { gallery } = content

  const updateImage = (index: number, val: string) => {
    const images = [...gallery.images]
    images[index] = val
    updateSection('gallery', { ...gallery, images })
  }

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Gallery</h2>
      <BilingualField label="Title" value={gallery.title} onChange={(v) => updateSection('gallery', { ...gallery, title: v })} />
      <BilingualField label="Subtitle" value={gallery.subtitle} onChange={(v) => updateSection('gallery', { ...gallery, subtitle: v })} />

      <div className="space-y-3">
        <Label className="text-sm font-medium text-charcoal/70">Image Paths</Label>
        {gallery.images.map((src, i) => (
          <Input
            key={i}
            value={src}
            onChange={(e) => updateImage(i, e.target.value)}
            placeholder={`/gallery/image-${i + 1}.jpg`}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `about-editor.tsx`**

```tsx
'use client'

import { useContentStore } from '../../store/content-store'
import { BilingualField } from './_bilingal-field'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

export function AboutEditor() {
  const { content, updateSection } = useContentStore()
  const { about } = content

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">About</h2>
      <BilingualField label="Title" value={about.title} onChange={(v) => updateSection('about', { ...about, title: v })} />

      <div className="space-y-2">
        <Label className="text-sm font-medium text-charcoal/70">Body Text</Label>
        <Tabs defaultValue="ka">
          <TabsList className="h-8">
            <TabsTrigger value="ka" className="text-xs">KA</TabsTrigger>
            <TabsTrigger value="en" className="text-xs">EN</TabsTrigger>
          </TabsList>
          {(['ka', 'en'] as const).map((lang) => (
            <TabsContent key={lang} value={lang}>
              <Textarea
                value={about.body[lang]}
                onChange={(e) => updateSection('about', { ...about, body: { ...about.body, [lang]: e.target.value } })}
                rows={6}
                className="w-full"
              />
            </TabsContent>
          ))}
        </Tabs>
        <p className="text-xs text-charcoal/40">Separate paragraphs with a blank line.</p>
      </div>

      <div>
        <Label className="text-sm text-charcoal/70">Image Path</Label>
        <Input value={about.image} onChange={(e) => updateSection('about', { ...about, image: e.target.value })} placeholder="/about/winery.jpg" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `contact-editor.tsx`**

```tsx
'use client'

import { useContentStore } from '../../store/content-store'
import { BilingualField } from './_bilingal-field'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'

export function ContactEditor() {
  const { content, updateSection } = useContentStore()
  const { contact } = content

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Contact</h2>
      <BilingualField label="Section Title" value={contact.title} onChange={(v) => updateSection('contact', { ...contact, title: v })} />
      <BilingualField label="Subtitle" value={contact.subtitle} onChange={(v) => updateSection('contact', { ...contact, subtitle: v })} />
      <BilingualField label="Address" value={contact.address} onChange={(v) => updateSection('contact', { ...contact, address: v })} />

      <div>
        <Label className="text-sm text-charcoal/70">Email</Label>
        <Input value={contact.email} onChange={(e) => updateSection('contact', { ...contact, email: e.target.value })} />
      </div>
      <div>
        <Label className="text-sm text-charcoal/70">Phone</Label>
        <Input value={contact.phone} onChange={(e) => updateSection('contact', { ...contact, phone: e.target.value })} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/tsabola/admin/editors/gallery-editor.tsx src/features/tsabola/admin/editors/about-editor.tsx src/features/tsabola/admin/editors/contact-editor.tsx
git commit -m "feat: add Gallery, About, Contact content editors"
```

---

### Task 14: Theme Editor + Visibility Editor

**Files:**
- Create: `src/features/tsabola/admin/theme-editor.tsx`
- Create: `src/features/tsabola/admin/visibility-editor.tsx`

- [ ] **Step 1: Create `theme-editor.tsx`**

```tsx
'use client'

import { useContentStore } from '../store/content-store'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'

export function ThemeEditor() {
  const { theme, setTheme } = useContentStore()

  return (
    <div className="max-w-sm space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Theme</h2>

      <div className="space-y-4">
        {([
          ['Wine Color', 'colorWine'],
          ['Charcoal Color', 'colorCharcoal'],
          ['Cream Color', 'colorCream'],
        ] as const).map(([label, key]) => (
          <div key={key} className="flex items-center gap-4">
            <Label className="w-32 text-sm text-charcoal/70">{label}</Label>
            <input
              type="color"
              value={theme[key]}
              onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
              className="h-9 w-16 rounded border border-border-wine cursor-pointer"
            />
            <span className="text-xs text-charcoal/40 font-mono">{theme[key]}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Label className="w-32 text-sm text-charcoal/70">Heading Size</Label>
          <Select value={theme.headingSize} onValueChange={(v) => setTheme({ ...theme, headingSize: v as 'sm' | 'md' | 'lg' })}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Label className="w-32 text-sm text-charcoal/70">Body Size</Label>
          <Select value={theme.bodySize} onValueChange={(v) => setTheme({ ...theme, bodySize: v as 'sm' | 'md' })}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-charcoal/40">Color changes apply live to the public site.</p>
    </div>
  )
}
```

- [ ] **Step 2: Create `visibility-editor.tsx`**

```tsx
'use client'

import { useContentStore } from '../store/content-store'
import { Switch } from '@/shared/components/ui/switch'
import { Label } from '@/shared/components/ui/label'

const SECTIONS = [
  { key: 'hero', label: 'Hero' },
  { key: 'wines', label: 'Wine Catalog' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'about', label: 'About' },
  { key: 'contact', label: 'Contact' },
] as const

export function VisibilityEditor() {
  const { visibility, setVisibility } = useContentStore()

  return (
    <div className="max-w-sm space-y-6">
      <h2 className="font-display text-2xl font-bold text-charcoal">Section Visibility</h2>
      <p className="text-sm text-charcoal/50">Header and Footer are always visible.</p>

      <div className="space-y-4">
        {SECTIONS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-2 border-b border-border-wine">
            <Label className="text-sm font-medium text-charcoal">{label}</Label>
            <Switch
              checked={visibility[key]}
              onCheckedChange={(checked) => setVisibility({ ...visibility, [key]: checked })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Open `/admin` → Theme. Change wine color using the color picker. Open public site in another tab — wine color updates on next load or instantly if the tab is already open.
Open `/admin` → Sections. Toggle off Gallery. Check public site — gallery section hidden.

- [ ] **Step 4: Commit**

```bash
git add src/features/tsabola/admin/theme-editor.tsx src/features/tsabola/admin/visibility-editor.tsx
git commit -m "feat: add Theme and Visibility editors in admin panel"
```

---

### Task 15: Export JSON + Reset to Defaults

**Files:**
- Create: `src/features/tsabola/admin/export-reset.tsx`
- Modify: `src/features/tsabola/admin/admin-panel.tsx` — import `ExportReset`

**Interfaces:**
- Consumes: `useContentStore()` — `content`, `theme`, `visibility`, `resetToDefaults()`

- [ ] **Step 1: Create `export-reset.tsx`**

```tsx
'use client'

import { useContentStore } from '../store/content-store'
import { Button } from '@/shared/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'

export function ExportReset() {
  const { content, theme, visibility, resetToDefaults } = useContentStore()

  const handleExport = () => {
    const data = JSON.stringify({ content, theme, visibility }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tsabola-content.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-sm space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Actions</h2>

      <div className="space-y-4">
        <div className="p-4 border border-border-wine rounded">
          <p className="text-sm font-medium text-charcoal mb-2">Export Content</p>
          <p className="text-xs text-charcoal/50 mb-4">
            Downloads current content, theme, and visibility as JSON. Use to back up or import into a future CMS.
          </p>
          <Button onClick={handleExport} variant="outline" className="border-wine text-wine hover:bg-wine/5">
            Download tsabola-content.json
          </Button>
        </div>

        <div className="p-4 border border-red-200 rounded">
          <p className="text-sm font-medium text-charcoal mb-2">Reset to Defaults</p>
          <p className="text-xs text-charcoal/50 mb-4">
            Restores all content, theme, and visibility to their original defaults. This cannot be undone.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                Reset to Defaults
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all content?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will restore all content, theme, and section visibility to their defaults.
                  All your edits will be lost. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetToDefaults} className="bg-red-600 hover:bg-red-700 text-white">
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify export in browser**

Open `/admin` → Export JSON. Click "Download tsabola-content.json". Verify file downloads with correct JSON structure including `content`, `theme`, `visibility` keys.

- [ ] **Step 3: Verify reset in browser**

Edit a wine name. Open Export JSON → Reset. Click Reset. Confirm in dialog. Check wine name restored.

- [ ] **Step 4: Run all tests**

```bash
npm run test:run
```

Expected: all tests pass

- [ ] **Step 5: Final commit**

```bash
git add src/features/tsabola/admin/export-reset.tsx
git commit -m "feat: add Export JSON and Reset to Defaults in admin panel"
```

---

## Post-Implementation Checklist

- [ ] `npm run dev` — public site loads at `http://localhost:3000`
- [ ] KA/EN switcher instantly translates all text without reload
- [ ] Language persists after page refresh
- [ ] All 4 wines display with names, badges, prices in active language
- [ ] 6 gallery placeholder tiles render
- [ ] Admin panel loads at `http://localhost:3000/admin`
- [ ] Editing any content in admin instantly reflects on public site
- [ ] Color picker in Theme editor live-updates public site colors
- [ ] Section toggles in Visibility editor show/hide sections
- [ ] Export JSON downloads valid JSON file
- [ ] Reset to Defaults restores original content after confirmation
- [ ] `npm run test:run` — all tests pass
- [ ] `npm run typecheck` — no TypeScript errors
