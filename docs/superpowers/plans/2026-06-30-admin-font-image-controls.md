# Admin Panel: Font Controls & Image Upload — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add font family + size controls to ThemeEditor, wire up existing (non-functional) size controls via CSS, and add Cloudinary image upload to the News editor.

**Architecture:** Extend `ThemeConfig` with `headingFont`/`bodyFont` fields stored as CSS variable name strings. `TsabolaPage` applies them via `document.documentElement.style.setProperty`. Font sizes use wrapper-div CSS classes with compound selectors that beat Tailwind utility specificity. News editor gains `ImageUploadButton` matching the About/Hero pattern.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, Zustand persist, next/font/google, shadcn/ui Select, Cloudinary (existing ImageUploadButton)

## Global Constraints

- No inline `style={{}}` props anywhere — use Tailwind classes only
- No arbitrary Tailwind values (`text-[10px]`, `px-[28px]` etc.) — use standard scale
- No `interface` — always `type`
- All imports use `@/` alias, never `../` across directories
- KA and EN fields must both be present in bilingual content (`L` type)
- Pre-commit hook runs `lint → build → test` — every commit must pass all three
- No new files — all 7 changes are to existing files

---

## Task 1: Extend ThemeConfig type, defaults, and font loading

**Files:**
- Modify: `src/features/tsabola/types/index.ts`
- Modify: `src/features/tsabola/content/site-content.ts`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `ThemeConfig` with `headingFont: string`, `bodyFont: string`, `headingSize: 'xs'|'sm'|'md'|'lg'|'xl'`, `bodySize: 'xs'|'sm'|'md'|'lg'`
- Produces: CSS variables `--font-cormorant`, `--font-lora`, `--font-poppins`, `--font-raleway` defined on `<html>` element
- Produces: `DEFAULT_THEME` with `headingFont: '--font-space-grotesk'`, `bodyFont: '--font-sans'`

- [ ] **Step 1: Update ThemeConfig type**

Replace the `ThemeConfig` type in `src/features/tsabola/types/index.ts`:

```ts
export type ThemeConfig = {
  colorWine: string
  colorCharcoal: string
  colorCream: string
  headingSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  bodySize: 'xs' | 'sm' | 'md' | 'lg'
  headingFont: string
  bodyFont: string
}
```

- [ ] **Step 2: Update DEFAULT_THEME**

In `src/features/tsabola/content/site-content.ts`, replace the `DEFAULT_THEME` export:

```ts
export const DEFAULT_THEME: ThemeConfig = {
  colorWine: '#722F37',
  colorCharcoal: '#1a1a1a',
  colorCream: '#faf8f5',
  headingSize: 'lg',
  bodySize: 'md',
  headingFont: '--font-space-grotesk',
  bodyFont: '--font-sans',
}
```

- [ ] **Step 3: Add 4 new Google Font imports to layout.tsx**

Replace the entire content of `src/app/layout.tsx` with:

```tsx
import { Cormorant_Garamond, Geist_Mono, Inter, Lora, Playfair_Display, Poppins, Raleway, Space_Grotesk } from 'next/font/google';
import { type ReactNode } from 'react';

import { APP_DESCRIPTION, APP_NAME } from '@/shared/const/app.const';
import { ThemeProvider } from '@/shared/providers/theme-provider';

import type { Metadata } from 'next';

import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const playfairDisplay = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable} ${lora.variable} ${poppins.variable} ${raleway.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Run build to verify TypeScript compiles cleanly**

```bash
npm run build
```

Expected: build succeeds. TypeScript will flag any usage of the old `'sm' | 'md'` bodySize union in `theme-editor.tsx` (the cast `v as 'sm' | 'md'`) — that is expected and will be fixed in Task 3. For now confirm build either passes or fails only on that cast.

- [ ] **Step 5: Commit**

```bash
git add src/features/tsabola/types/index.ts src/features/tsabola/content/site-content.ts src/app/layout.tsx
git commit -m "feat: extend ThemeConfig with font fields and pre-load 6 font families"
```

---

## Task 2: CSS infrastructure for font and size switching

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/features/tsabola/components/tsabola-page.tsx`

**Interfaces:**
- Consumes: `ThemeConfig.headingFont`, `ThemeConfig.bodyFont`, `ThemeConfig.headingSize`, `ThemeConfig.bodySize` from Task 1
- Produces: CSS classes `.heading-xs` through `.heading-xl` that override h1/h2/h3 font-size with compound-selector specificity
- Produces: CSS classes `.body-xs` through `.body-lg` that set font-size on wrapper div (inherited by children)
- Produces: CSS variable `--font-body` for safe body font switching (avoids circular `--font-sans` reference)
- Produces: `TsabolaPage` wrapper div with dynamic `heading-{size}` and `body-{size}` classes
- Produces: theme `useEffect` that sets `--font-heading` and `--font-body` CSS vars on `documentElement`

- [ ] **Step 1: Add --font-body to @theme inline and fix html base rule**

In `src/app/globals.css`, make these two changes:

**Change 1** — in the `@theme inline` block, add one line after `--font-heading: var(--font-space-grotesk);`:
```css
  --font-body: var(--font-sans);
```

Full updated `@theme inline` block (show only the font lines for clarity — do not remove any other lines):
```css
@theme inline {
  /* ... all existing lines unchanged ... */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-space-grotesk);
  --font-body: var(--font-sans);        /* NEW */
  --font-display: var(--font-display);
  /* ... rest unchanged ... */
}
```

**Change 2** — in `@layer base`, replace:
```css
  html {
    @apply font-sans;
  }
```
with:
```css
  html {
    font-family: var(--font-body);
  }
```

Why: `--font-body` is an intermediary. When `TsabolaPage` sets `--font-body: var(--font-poppins)` as an inline style on `html`, that inline style overrides the stylesheet definition. Setting `--font-sans` directly would create a circular CSS variable reference (Inter itself is `--font-sans`), which CSS marks as guaranteed-invalid.

- [ ] **Step 2: Add heading and body size utility classes**

Append to `src/app/globals.css`, at the end of the file inside the existing `@layer utilities` block (add before the closing `}`):

```css
  /* Admin-controlled heading size scale */
  /* Compound selectors (.heading-lg h1) have specificity 0,1,1 vs Tailwind's */
  /* single-class utilities (.text-5xl) at 0,1,0 — compound wins */
  .heading-xs h1 { font-size: 1.5rem; }
  .heading-xs h2 { font-size: 1.25rem; }
  .heading-xs h3 { font-size: 1.125rem; }
  .heading-sm h1 { font-size: 2rem; }
  .heading-sm h2 { font-size: 1.5rem; }
  .heading-sm h3 { font-size: 1.25rem; }
  .heading-md h1 { font-size: 2.5rem; }
  .heading-md h2 { font-size: 2rem; }
  .heading-md h3 { font-size: 1.5rem; }
  .heading-lg h1 { font-size: 3rem; }
  .heading-lg h2 { font-size: 2.25rem; }
  .heading-lg h3 { font-size: 1.875rem; }
  .heading-xl h1 { font-size: 4rem; }
  .heading-xl h2 { font-size: 3rem; }
  .heading-xl h3 { font-size: 2.25rem; }

  /* Admin-controlled body size scale */
  .body-xs { font-size: 0.75rem; }
  .body-sm { font-size: 0.875rem; }
  .body-md { font-size: 1rem; }
  .body-lg { font-size: 1.125rem; }
```

- [ ] **Step 3: Extend the theme useEffect in TsabolaPage**

In `src/features/tsabola/components/tsabola-page.tsx`, replace the theme `useEffect` and wrapper div:

```tsx
'use client'

import { useEffect } from 'react'

import { TsabolaAbout } from './tsabola-about'
import { TsabolaContact } from './tsabola-contact'
import { TsabolaFooter } from './tsabola-footer'
import { TsabolaGallery } from './tsabola-gallery'
import { TsabolaHeader } from './tsabola-header'
import { TsabolaHero } from './tsabola-hero'
import { TsabolaNews } from './tsabola-news'
import { TsabolaWineCatalog } from './tsabola-wine-catalog'
import { useLang } from '../hooks/use-lang'

export function TsabolaPage() {
  const { lang, theme, visibility } = useLang()

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--wine', theme.colorWine)
    root.style.setProperty('--charcoal', theme.colorCharcoal)
    root.style.setProperty('--cream', theme.colorCream)
    root.style.setProperty('--font-heading', `var(${theme.headingFont ?? '--font-space-grotesk'})`)
    root.style.setProperty('--font-body', `var(${theme.bodyFont ?? '--font-sans'})`)
  }, [theme])

  return (
    <div className={`flex flex-col min-h-screen heading-${theme.headingSize ?? 'lg'} body-${theme.bodySize ?? 'md'}`}>
      <TsabolaHeader />
      <main>
        {visibility.hero && <TsabolaHero />}
        {visibility.about && <TsabolaAbout />}
        {visibility.wines && <TsabolaWineCatalog />}
        {visibility.news && <TsabolaNews />}
        {visibility.gallery && <TsabolaGallery />}
        {visibility.contact && <TsabolaContact />}
      </main>
      <TsabolaFooter />
    </div>
  )
}
```

- [ ] **Step 4: Run build and tests**

```bash
npm run build
```

Expected: build passes. The existing `theme-editor.tsx` type cast (`v as 'sm' | 'md'`) is technically a narrower type than the new `bodySize` union but TypeScript will not error because the cast overrides type checking — it will still work at runtime. Confirm no build errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/features/tsabola/components/tsabola-page.tsx
git commit -m "feat: wire up font-family and font-size CSS vars from theme store"
```

---

## Task 3: ThemeEditor — Typography section

**Files:**
- Modify: `src/features/tsabola/admin/theme-editor.tsx`

**Interfaces:**
- Consumes: `ThemeConfig.headingFont`, `ThemeConfig.bodyFont` (Task 1), `ThemeConfig.headingSize` extended union, `ThemeConfig.bodySize` extended union
- Consumes: CSS font variables `--font-space-grotesk`, `--font-display`, `--font-cormorant`, `--font-lora`, `--font-poppins`, `--font-raleway`, `--font-sans` (all defined on `<html>` after Task 1)
- Produces: Admin UI with Colors section + Typography section in ThemeEditor

- [ ] **Step 1: Rewrite ThemeEditor with Typography section**

Replace the full content of `src/features/tsabola/admin/theme-editor.tsx`:

```tsx
'use client'

import { useContentStore } from '@/features/tsabola/store/content-store'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'

const HEADING_FONTS = [
  { label: 'Space Grotesk', value: '--font-space-grotesk' },
  { label: 'Playfair Display', value: '--font-display' },
  { label: 'Cormorant Garamond', value: '--font-cormorant' },
  { label: 'Lora', value: '--font-lora' },
  { label: 'Poppins', value: '--font-poppins' },
  { label: 'Raleway', value: '--font-raleway' },
]

const BODY_FONTS = [
  { label: 'Inter', value: '--font-sans' },
  { label: 'Poppins', value: '--font-poppins' },
  { label: 'Lora', value: '--font-lora' },
  { label: 'Space Grotesk', value: '--font-space-grotesk' },
]

export function ThemeEditor() {
  const { theme, setTheme } = useContentStore()

  return (
    <div className="max-w-sm space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">Theme</h2>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Colors</p>
        {(
          [
            ['Wine Color', 'colorWine'],
            ['Charcoal Color', 'colorCharcoal'],
            ['Cream Color', 'colorCream'],
          ] as const
        ).map(([label, key]) => (
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
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/40">Typography</p>

        <div className="flex items-center gap-4">
          <Label className="w-32 text-sm text-charcoal/70">Heading Font</Label>
          <Select
            value={theme.headingFont ?? '--font-space-grotesk'}
            onValueChange={(v) => setTheme({ ...theme, headingFont: v })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HEADING_FONTS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Label className="w-32 text-sm text-charcoal/70">Body Font</Label>
          <Select
            value={theme.bodyFont ?? '--font-sans'}
            onValueChange={(v) => setTheme({ ...theme, bodyFont: v })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BODY_FONTS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Label className="w-32 text-sm text-charcoal/70">Heading Size</Label>
          <Select
            value={theme.headingSize ?? 'lg'}
            onValueChange={(v) => setTheme({ ...theme, headingSize: v as 'xs' | 'sm' | 'md' | 'lg' | 'xl' })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xs">Extra Small</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Label className="w-32 text-sm text-charcoal/70">Body Size</Label>
          <Select
            value={theme.bodySize ?? 'md'}
            onValueChange={(v) => setTheme({ ...theme, bodySize: v as 'xs' | 'sm' | 'md' | 'lg' })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xs">Extra Small</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-charcoal/40">Changes apply live to the public site.</p>
    </div>
  )
}
```

- [ ] **Step 2: Run build and tests**

```bash
npm run build
```

Expected: build passes with no TypeScript errors. The old `as 'sm' | 'md'` cast is gone; the new `as 'xs' | 'sm' | 'md' | 'lg' | 'xl'` and `as 'xs' | 'sm' | 'md' | 'lg'` casts are correct.

- [ ] **Step 3: Commit**

```bash
git add src/features/tsabola/admin/theme-editor.tsx
git commit -m "feat: add font family and extended size controls to ThemeEditor"
```

---

## Task 4: News editor image upload

**Files:**
- Modify: `src/features/tsabola/admin/editors/news-editor.tsx`

**Interfaces:**
- Consumes: `ImageUploadButton` from `@/features/tsabola/components/image-upload-button` — props: `onUpload: (url: string) => void`, `folder?: string`
- Consumes: `NewsItem.image: string` (existing field)
- Produces: Cloudinary upload button next to the image path input in each expanded news item

- [ ] **Step 1: Add ImageUploadButton import and replace image field**

In `src/features/tsabola/admin/editors/news-editor.tsx`:

**Add import** after the existing imports (line 10, after `import { BilingualField } from './_bilingual-field'`):

```tsx
import { ImageUploadButton } from '@/features/tsabola/components/image-upload-button'
```

**Replace the image path field** inside the expanded item form. Find this block (inside `{expandedId === item.id && ...}`, in the `grid grid-cols-2` div):

```tsx
<div>
  <Label className="text-sm text-charcoal/70">Image path</Label>
  <Input
    value={item.image}
    onChange={(e) => updateItem(i, { ...item, image: e.target.value })}
    placeholder="/news/item.jpg"
  />
</div>
```

Replace with:

```tsx
<div>
  <Label className="text-sm text-charcoal/70">Image</Label>
  <div className="flex gap-2">
    <Input
      value={item.image}
      onChange={(e) => updateItem(i, { ...item, image: e.target.value })}
      placeholder="https://... or /news/item.jpg"
    />
    <ImageUploadButton
      onUpload={(url) => updateItem(i, { ...item, image: url })}
      folder="tsabola/news"
    />
  </div>
</div>
```

The `grid grid-cols-2 gap-4` wrapper on the date + image fields means both are in a 2-column grid row. The image field now has the upload button alongside the input. Adjust the grid to `grid-cols-1` for the image field if the layout feels cramped, but the `flex gap-2` inside handles it.

Actually, the date + image are siblings in a `grid grid-cols-2 gap-4`. Leave the outer grid unchanged — the inner `flex gap-2` on the image field is sufficient for layout.

- [ ] **Step 2: Run lint, build, and tests**

```bash
npm run build
```

Expected: build passes. The `ImageUploadButton` import resolves correctly — it is already used in `about-editor.tsx`, `hero-editor.tsx`, and `wines-editor.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/features/tsabola/admin/editors/news-editor.tsx
git commit -m "feat: add Cloudinary image upload to news editor items"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Font family controls (heading + body) — Task 3 ThemeEditor
- ✅ Font size controls (xs/sm/md/lg/xl for heading, xs/sm/md/lg for body) — Task 3 ThemeEditor
- ✅ Font sizes wired to CSS — Task 2 globals.css + tsabola-page.tsx
- ✅ Font families wired to CSS — Task 2 tsabola-page.tsx useEffect
- ✅ 4 new fonts loaded at build time — Task 1 layout.tsx
- ✅ ThemeConfig extended — Task 1 types/index.ts
- ✅ DEFAULT_THEME updated — Task 1 site-content.ts
- ✅ News image upload — Task 4 news-editor.tsx
- ✅ Auto-save (existing Zustand persist — no change needed)
- ✅ Immediate reflection (existing useEffect pattern — extended in Task 2)
- ✅ --font-body intermediary to avoid circular CSS var — Task 2 globals.css
- ✅ No new files created

**Type consistency:**
- `theme.headingFont` — set in Task 1, read in Task 2 (useEffect), used as Select value in Task 3 ✓
- `theme.bodyFont` — set in Task 1, read in Task 2 (useEffect), used as Select value in Task 3 ✓
- `theme.headingSize` `'xs'|'sm'|'md'|'lg'|'xl'` — defined Task 1, used in wrapper class Task 2, Select value/cast Task 3 ✓
- `theme.bodySize` `'xs'|'sm'|'md'|'lg'` — defined Task 1, used in wrapper class Task 2, Select value/cast Task 3 ✓
- `ImageUploadButton` props `onUpload` + `folder` — same signature as about-editor.tsx usage ✓
