# Admin Panel: Font Controls & Image Upload — Design Spec

**Date:** 2026-06-30  
**Status:** Approved

---

## Summary

Extend the Tsabola Admin Panel with:
1. Font family selection (heading + body) — curated 6-font set pre-loaded at build time
2. Extended font size scale (xs/sm/md/lg/xl) — wires up existing but non-functional headingSize/bodySize controls
3. Image upload button on News items — parity with Hero, Wines, About, Gallery

All changes persist via existing Zustand + localStorage. All changes reflect immediately on the public site (same mechanism as color theme changes). No new files. 7 files modified.

---

## Problem Statement

- `headingSize` and `bodySize` exist in `ThemeConfig` and `ThemeEditor` but are **never applied** to the UI — stored silently, no effect.
- No font family control exists anywhere; fonts hard-coded in `layout.tsx`.
- News items have an image path input but no Cloudinary upload button, unlike every other section.

---

## Approach

**Approach A selected:** Extend `ThemeEditor` with a Typography subsection. Single place for all visual appearance. No new sidebar items, no new files.

---

## Data Model Changes

### `src/features/tsabola/types/index.ts`

Extend `ThemeConfig`:

```ts
export type ThemeConfig = {
  colorWine: string
  colorCharcoal: string
  colorCream: string
  headingSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  bodySize: 'xs' | 'sm' | 'md' | 'lg'
  headingFont: string  // CSS variable name, e.g. '--font-space-grotesk'
  bodyFont: string     // CSS variable name, e.g. '--font-sans'
}
```

Changes from current:
- `headingSize`: `'sm' | 'md' | 'lg'` → `'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- `bodySize`: `'sm' | 'md'` → `'xs' | 'sm' | 'md' | 'lg'`
- `headingFont`: new field, stored as CSS variable name string
- `bodyFont`: new field, stored as CSS variable name string

### `src/features/tsabola/content/site-content.ts`

Update `DEFAULT_THEME`:

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

---

## Font Loading

### `src/app/layout.tsx`

Add 4 new Google Font imports. Keep existing 4 (Inter, Space Grotesk, Geist Mono, Playfair Display).

New additions:

| Import | Variable | Display Name | Role |
|--------|----------|--------------|------|
| `Cormorant_Garamond` | `--font-cormorant` | Cormorant Garamond | heading |
| `Lora` | `--font-lora` | Lora | heading + body |
| `Poppins` | `--font-poppins` | Poppins | heading + body |
| `Raleway` | `--font-raleway` | Raleway | heading |

All font variables added to `<html>` className so their CSS variables are always defined on the page.

**Heading font options (6):** Space Grotesk, Playfair Display, Cormorant Garamond, Lora, Poppins, Raleway  
**Body font options (4):** Inter, Poppins, Lora, Space Grotesk

---

## CSS Application

### `src/features/tsabola/components/tsabola-page.tsx`

Extend the existing theme `useEffect` to apply font family and font size CSS custom properties:

```ts
useEffect(() => {
  const root = document.documentElement
  // existing
  root.style.setProperty('--wine', theme.colorWine)
  root.style.setProperty('--charcoal', theme.colorCharcoal)
  root.style.setProperty('--cream', theme.colorCream)
  // new: font families
  root.style.setProperty('--font-heading', `var(${theme.headingFont ?? '--font-space-grotesk'})`)
  root.style.setProperty('--font-body', `var(${theme.bodyFont ?? '--font-sans'})`)
}, [theme])
```

Font family override works because `--font-heading` and `--font-body` are defined in `globals.css @theme inline` as static values. Setting them as inline styles on `documentElement` overrides the stylesheet definition (inline styles beat stylesheet rules).

**Important — why `--font-body` not `--font-sans`:** Inter is loaded by next/font with `variable: '--font-sans'`. Calling `root.style.setProperty('--font-sans', 'var(--font-sans)')` (the default reset case) creates a circular CSS custom property reference, which the CSS spec marks as guaranteed-invalid. `--font-body` is an intermediary variable that avoids this: setting it to `var(--font-sans)` is never circular.

Font sizes are applied via wrapper-div CSS class (see below) — not via `style.setProperty` — to keep the `useEffect` clean.

Apply dynamic class to the root wrapper div in `TsabolaPage`:

```tsx
<div className={`flex flex-col min-h-screen heading-${theme.headingSize ?? 'lg'} body-${theme.bodySize ?? 'md'}`}>
```

### `src/app/globals.css`

Add to `@theme inline`:
```css
--font-body: var(--font-sans);  /* intermediary — avoids circular ref when overriding */
```

Change `@layer base`:
```css
/* Before */
html { @apply font-sans; }

/* After */
html { font-family: var(--font-body); }
```

Add to `@layer utilities`:

```css
@layer utilities {
  /* Heading size scale — compound selectors beat Tailwind single-class utilities */
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

  /* Body size scale */
  .body-xs { font-size: 0.75rem; }
  .body-sm { font-size: 0.875rem; }
  .body-md { font-size: 1rem; }
  .body-lg { font-size: 1.125rem; }
}
```

**Why compound selectors work:** `.heading-lg h1` has specificity 0,1,1 (1 class + 1 element). Tailwind's `.text-5xl` has specificity 0,1,0 (1 class). The compound selector wins, so `.heading-lg h1 { font-size: 3rem }` overrides `<h1 className="text-5xl">`. Body size applies `font-size` to the wrapper div — children without explicit text-size classes inherit it.

**Reduced-motion guard:** Not needed for font-size/font-family changes (no animation).

---

## ThemeEditor UI

### `src/features/tsabola/admin/theme-editor.tsx`

Reorganize into two sections:

**Colors** (existing, unchanged behavior):
- Wine Color hex picker
- Charcoal Color hex picker
- Cream Color hex picker

**Typography** (new section):
- Heading Font — `<Select>` with 6 options (display name → CSS var name)
- Body Font — `<Select>` with 4 options
- Heading Size — `<Select>` extended to 5 steps (xs/sm/md/lg/xl)
- Body Size — `<Select>` extended to 4 steps (xs/sm/md/lg)

Font options map display names to CSS variable name strings stored in `ThemeConfig`:

```ts
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
```

The `onValueChange` handler calls `setTheme({ ...theme, headingFont: v })` — same pattern as existing headingSize/bodySize controls.

---

## News Image Upload

### `src/features/tsabola/admin/editors/news-editor.tsx`

In the expanded item form, replace the standalone image `<Input>` with a flex row containing `<Input>` + `<ImageUploadButton>`:

```tsx
import { ImageUploadButton } from '@/features/tsabola/components/image-upload-button'

// In the expanded item form, replace:
<div>
  <Label>Image path</Label>
  <Input value={item.image} onChange={...} placeholder="/news/item.jpg" />
</div>

// With:
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

Matches the exact pattern in `about-editor.tsx`. Upload goes to Cloudinary folder `tsabola/news`.

---

## File Summary

| File | Change |
|------|--------|
| `src/features/tsabola/types/index.ts` | Extend `ThemeConfig` type (+2 fields, wider unions) |
| `src/features/tsabola/content/site-content.ts` | Add `headingFont`/`bodyFont` to `DEFAULT_THEME` |
| `src/app/layout.tsx` | Add 4 Google Font imports + variables to `<html>` className |
| `src/app/globals.css` | Add heading/body size utility classes to `@layer utilities` |
| `src/features/tsabola/components/tsabola-page.tsx` | Extend theme `useEffect` for font vars; add size classes to wrapper |
| `src/features/tsabola/admin/theme-editor.tsx` | Add Typography section with font family + extended size selects |
| `src/features/tsabola/admin/editors/news-editor.tsx` | Add `ImageUploadButton` to news item image field |

**No new files created.**

---

## Out of Scope

- Per-section font overrides (global only)
- Font weight controls
- Line height controls
- Runtime Google Fonts loading (would break next/font performance benefits)
- Cross-tab real-time sync (existing Zustand persist pattern, not changed)
