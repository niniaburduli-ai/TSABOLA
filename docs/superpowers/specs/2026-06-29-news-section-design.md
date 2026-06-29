# News Section Design

**Date:** 2026-06-29  
**Status:** Approved

## Overview

Add a News section between the Wines and Gallery sections on the Tsabola public page. Displays announcements about new wine arrivals, discounts, and similar updates. Each item has a bilingual title, bilingual body, a date string, and an optional image path. Fully editable via the existing admin panel.

## Data Shape

### New type `NewsItem` in `src/features/tsabola/types/index.ts`

```ts
export type NewsItem = {
  id: string
  title: L
  date: string   // display string e.g. "January 2025" — not bilingual
  body: L
  image: string  // path e.g. /news/item1.jpg — empty string = no image
}
```

### Additions to existing types in `src/features/tsabola/types/index.ts`

- `SiteContent.news`: `{ title: L; subtitle: L; items: NewsItem[] }`
- `SiteContent.nav`: add `news: L`
- `SectionVisibility`: add `news: boolean`

### Additions to `src/features/tsabola/content/site-content.ts`

- `DEFAULT_CONTENT.nav.news`: `{ ka: 'სიახლეები', en: 'News' }`
- `DEFAULT_CONTENT.news`: section title, subtitle, and 2 example items (new wine arrival + discount) in both languages
- `DEFAULT_VISIBILITY.news`: `true`

## Public Component

**File:** `src/features/tsabola/components/tsabola-news.tsx`

- Section `id="news"` for nav anchor
- Heading pattern identical to Gallery: small uppercase subtitle label → large display heading → wine-color `w-12 h-0.5` divider
- Card grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- Each card:
  - Top: image block (`aspect-video object-cover`). If `image` is empty, render placeholder `div` with `bg-gradient-to-br from-wine/15 via-cream to-charcoal/20` — same as gallery.
  - Body: date badge (`text-xs uppercase tracking-widest text-wine/70`), title (`font-display font-bold text-charcoal`), body text (`text-sm text-charcoal/70`)
- Section hidden when `visibility.news === false`
- Uses `useLang()` hook (`t`, `r`) — same as all other sections

## Page Order

In `src/features/tsabola/components/tsabola-page.tsx`, insert `TsabolaNews` between `TsabolaWineCatalog` and `TsabolaGallery`:

```
Hero → About → Wines → News → Gallery → Contact
```

## Admin Editor

**File:** `src/features/tsabola/admin/editors/news-editor.tsx`

- `useContentStore()` for read/write
- Section-level fields at top: `BilingualField` for title and subtitle
- Item list below (same collapsible-accordion pattern as WinesEditor):
  - Add button top-right
  - Each item row: display `title.ka || title.en || Item N` + collapse toggle + ↑ ↓ + Delete
  - Expanded panel: `BilingualField` for title, `BilingualField` for body, `Input` for date, `Input` for image path
- `id` generated as `news-${items.length + 1}` on add
- Reorder and delete mutate the `news.items` array via `updateSection('news', ...)`

## Admin Wiring

### `src/features/tsabola/admin/admin-sidebar.tsx`

- Add `'news'` to `CONTENT_SECTIONS` after `'wines'` (before `'gallery'`)

### `src/features/tsabola/admin/admin-panel.tsx`

- Import `NewsEditor`
- Add `news: NewsEditor` to `EDITOR_MAP`

## Visibility

`VisibilityEditor` has a hardcoded `SECTIONS` array. Add `{ key: 'news', label: 'News' }` after the `wines` entry so the toggle appears in the admin.

## Files Changed

| File | Change |
|------|--------|
| `src/features/tsabola/types/index.ts` | Add `NewsItem` type; extend `SiteContent`, `nav`, `SectionVisibility` |
| `src/features/tsabola/content/site-content.ts` | Add news defaults and visibility |
| `src/features/tsabola/components/tsabola-news.tsx` | New component |
| `src/features/tsabola/components/tsabola-page.tsx` | Insert `TsabolaNews` |
| `src/features/tsabola/admin/editors/news-editor.tsx` | New editor |
| `src/features/tsabola/admin/admin-sidebar.tsx` | Add 'news' to CONTENT_SECTIONS |
| `src/features/tsabola/admin/admin-panel.tsx` | Import and register NewsEditor |
| `src/features/tsabola/admin/visibility-editor.tsx` | Add news entry to hardcoded SECTIONS array |

## Out of Scope

- File upload (images use path strings, consistent with rest of codebase)
- News item tags/categories
- Pagination or filtering
