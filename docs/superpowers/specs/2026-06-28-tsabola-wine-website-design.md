# TSABOLA Wine Website — Design Spec

**Date:** 2026-06-28  
**Stack:** Next.js 16 · Tailwind CSS 4 · shadcn/ui · Zustand 5  
**Type:** Single-page public site + local Admin Panel (no backend, no database)

---

## 1. Goal

Premium, minimalist single-page informational website for Georgian wine brand **ცაბოლა (TSABOLA)**. Showcases wines, prices (₾), photos, and brand story. Not a shop.

Includes an **Admin Panel** at `/admin` for editing all content, theme, and section visibility — no code changes required. Runs locally first; architecture is designed to plug into a real backend/CMS later.

---

## 2. State Architecture

Two Zustand stores, both persisted to `localStorage`:

### `languageStore` — `tsabola-lang`
```ts
{ lang: 'ka' | 'en', setLang: (l: 'ka' | 'en') => void }
// default: 'ka'
```

### `contentStore` — `tsabola-content`
Holds ALL editable content. Initialized from `site-content.ts` defaults on first load.  
Admin panel writes to this store → public site reads from it → changes are instant and survive refresh.

```ts
interface ContentState {
  content: SiteContent          // full CMS data
  theme: ThemeConfig            // colors, font sizes
  visibility: SectionVisibility // show/hide per section
  setContent: (c: SiteContent) => void
  updateSection: <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => void
  setTheme: (t: ThemeConfig) => void
  setVisibility: (v: SectionVisibility) => void
  resetToDefaults: () => void
}

interface SectionVisibility {
  hero: boolean
  wines: boolean
  gallery: boolean
  about: boolean
  contact: boolean
}

interface ThemeConfig {
  colorWine: string       // default: #722F37
  colorCharcoal: string   // default: #1a1a1a
  colorCream: string      // default: #faf8f5
  headingSize: 'sm' | 'md' | 'lg'  // maps to Tailwind text sizes
  bodySize: 'sm' | 'md'
}
```

### `site-content.ts` — Default/fallback data only
Not imported by components directly. Used only to seed `contentStore` on first load.

---

## 3. Content Structure

All text fields are `{ ka: string; en: string }` — no exceptions.

```ts
type L = { ka: string; en: string }

interface SiteContent {
  site: { name: L; slogan: L }
  nav: { wines: L; gallery: L; about: L; contact: L }
  hero: { headline: L; subline: L; cta: L }
  wines: WineItem[]
  gallery: { title: L; subtitle: L; images: string[] }
  about: { title: L; body: L; imageAlt: L; image: string }
  contact: { title: L; subtitle: L; email: string; phone: string; address: L }
  footer: { copy: L }
}

interface WineItem {
  id: string
  name: L
  type: L
  typeBadge: L
  price: string        // "45₾"
  description: L
  image: string        // "/wines/rkatsiteli.jpg"
}
```

### `useLang()` Hook
`src/features/tsabola/hooks/use-lang.ts`
```ts
// Returns { t: SiteContent, theme: ThemeConfig, visibility: SectionVisibility, lang, setLang }
```

Resolver: `r(field: L, lang): string` — all components use `r(t.field, lang)`, never `.ka`/`.en` directly.

---

## 4. File Structure

```
src/
├── app/
│   ├── (public)/page.tsx           ← renders TsabolaPage
│   └── (admin)/
│       └── admin/page.tsx          ← renders AdminPanel (no auth for local use)
└── features/
    └── tsabola/
        ├── content/
        │   └── site-content.ts     ← DEFAULT {ka,en} data only
        ├── store/
        │   ├── language-store.ts   ← lang Zustand + persist
        │   └── content-store.ts    ← content+theme+visibility Zustand + persist
        ├── hooks/
        │   └── use-lang.ts         ← useLang() + r() resolver
        ├── components/
        │   ├── tsabola-page.tsx    ← public root assembler
        │   ├── tsabola-header.tsx
        │   ├── tsabola-hero.tsx
        │   ├── tsabola-wine-catalog.tsx
        │   ├── tsabola-wine-card.tsx
        │   ├── tsabola-gallery.tsx
        │   ├── tsabola-about.tsx
        │   ├── tsabola-contact.tsx
        │   └── tsabola-footer.tsx
        └── admin/
            ├── admin-panel.tsx     ← admin root with sidebar
            ├── admin-sidebar.tsx
            ├── admin-header.tsx    ← "Back to site" link
            ├── editors/
            │   ├── site-editor.tsx       ← site name, slogan
            │   ├── hero-editor.tsx
            │   ├── wines-editor.tsx      ← add/edit/delete wines, KA+EN fields
            │   ├── gallery-editor.tsx    ← image paths
            │   ├── about-editor.tsx
            │   ├── contact-editor.tsx
            │   └── footer-editor.tsx
            ├── theme-editor.tsx          ← color pickers + font size selects
            └── visibility-editor.tsx     ← toggle switches per section
```

---

## 5. Visual System

### Colors
CSS variables in `globals.css`, controlled by `ThemeConfig`:

```css
--wine:     #722F37
--charcoal: #1a1a1a
--cream:    #faf8f5
--border:   #e8e0d8
```

`TsabolaPage` writes theme CSS vars to `document.documentElement.style` via `useEffect` when `theme` changes — instant live preview from admin.

Tailwind tokens: `text-wine`, `bg-wine`, `bg-charcoal`, `bg-cream`.

### Typography
- **Headings:** `Playfair Display` (Google Font) → `--font-display`
- **Body:** `Inter` (installed) → `--font-sans`
- **Labels/prices:** `Space Grotesk` (installed) → `--font-heading`

### Image Placeholders
Styled `<div>` with `bg-gradient-to-br from-[--wine]/20 to-[--charcoal]/40`, `data-placeholder="true"`. Aspect ratios: `4/3` for wine cards, `square` for gallery. Swap by updating image path in admin.

---

## 6. Public Site Sections

### Header
- Sticky, `backdrop-blur-md bg-cream/90`
- Left: `ცაბოლა` in Playfair Display, wine-red
- Center: smooth-scroll nav links
- Right: `KA / EN` switcher — active = wine-red bold

### Hero
- `min-h-screen`, dark overlay placeholder bg
- Playfair Display headline + Inter subline
- Wine-red decorative `<hr>`

### Wine Catalog (`#wines`)
- 2×2 grid (1-col mobile → 2-col desktop)
- Cards: placeholder image, type badge, name (Playfair), price (Space Grotesk wine-red), desc

### Gallery (`#gallery`)
- 3-col grid (1→2→3 cols responsive)
- 6 placeholder tiles, hover wine-red tint overlay

### About (`#about`)
- Desktop: 2-col (text + placeholder portrait image)
- Family winery origin story, wine-red left border on first `<p>`

### Contact (`#contact`)
- Centered, no form
- Lucide icons + text for email, phone, address

### Footer
- `bg-charcoal text-cream`
- Logo left · nav center · copyright right

---

## 7. Admin Panel (`/admin`)

No authentication required for local use. A red banner reads "Local development — no auth".

### Layout
- Left sidebar (240px) with section links + theme/visibility links
- Top bar with "← Back to site" link
- Main area: the active editor

### Sidebar sections
```
── Content
   Site Info
   Hero
   Wines
   Gallery
   About
   Contact
   Footer
── Appearance
   Theme
   Sections
── Actions
   Reset to defaults
   Export JSON
```

### Content Editors
Each editor has **KA tab + EN tab** for bilingual fields. Single fields (email, price, image path) are shown without tabs.

**Wines Editor** additionally supports:
- Add new wine (fills defaults)
- Delete wine (with confirmation)
- Drag-to-reorder (using Zustand array update, no DnD library — up/down buttons)

**Theme Editor:**
- Color pickers for `wine`, `charcoal`, `cream` (HTML `<input type="color">`)
- Font size select for headings (`sm/md/lg`) and body (`sm/md`)
- Live preview: changes write CSS vars immediately via `contentStore.setTheme()`

**Visibility Editor:**
- shadcn `Switch` per section: Hero, Wines, Gallery, About, Contact
- Header and Footer are always visible (cannot hide)

### Export JSON
Downloads current `contentStore` state as `tsabola-content.json` — ready for future backend import.

### Reset to Defaults
Calls `contentStore.resetToDefaults()` → reseeds from `site-content.ts`. Shows confirmation dialog (shadcn `AlertDialog`).

---

## 8. Placeholder Content (KA/EN)

### Wines
| id | name KA / EN | type | price |
|----|------|------|-------|
| rkatsiteli | რქაწითელი / Rkatsiteli | Amber | 45₾ |
| saperavi | საფერავი / Saperavi | Red | 55₾ |
| mtsvane | მწვანე / Mtsvane | White | 40₾ |
| rose | კახური როზე / Kakhuri Rosé | Rosé | 48₾ |

### Contact
- Email: `info@tsabola.ge`
- Phone: `+995 555 000 000`
- Address KA: `კახეთი, საქართველო` / EN: `Kakheti, Georgia`

---

## 9. Future Backend Integration Points

The architecture is designed so that swapping `localStorage` for a real API requires only:
1. Replace `persist` middleware in `contentStore` with API fetch on mount + debounced save
2. Replace Export JSON with a real POST endpoint
3. Add auth to the `/admin` route

No component changes needed.

---

## 10. Constraints

- No new npm dependencies (all tooling already installed)
- Playfair Display via `next/font/google`
- `document.documentElement.lang` updated via `useEffect` in `tsabola-page.tsx`
- Theme CSS vars applied via `useEffect` in `tsabola-page.tsx`
- Mobile-first responsive throughout
- Light mode only

---

## 11. Out of Scope

- E-commerce / cart / checkout
- Form submission / email sending
- User authentication
- Dark mode
- Real image upload (images referenced by path only)
- Complex animations
