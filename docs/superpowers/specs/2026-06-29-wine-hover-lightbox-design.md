# Wine Hover & Lightbox — Design Spec

## Summary

Add an interactive hover animation and click-to-lightbox feature to wine bottle images in the `TsabolaWineCatalog` section.

---

## 1. Hover Effect

CSS-only, no JS. Applied to the image wrapper inside `TsabolaWineCard`.

- `@keyframes wine-float` added to `globals.css` — translates the image ±4px on Y axis over 3 s, ease-in-out, infinite
- Utility class `.animate-wine-float` defined in `@layer utilities`
- Guarded by `@media (prefers-reduced-motion: reduce)` — disables animation for accessibility
- Image wrapper gets `group overflow-hidden cursor-pointer`
- `<img>` gets `group-hover:scale-105 transition-transform duration-500 group-hover:animate-wine-float`

---

## 2. WineItem Type Extension

File: `src/features/tsabola/types/index.ts`

Add optional fields to `WineItem`:

```ts
longDescription?: L   // narrative paragraph shown in modal
serveTemp?: string    // e.g. "10–12°C"
alcohol?: string      // e.g. "13%"
volume?: string       // e.g. "750 მლ / 750 ml"
```

---

## 3. site-content.ts Update

File: `src/features/tsabola/content/site-content.ts`

Populate the white wine entry with new fields (both KA and EN):

**White wine KA:**
- `longDescription.ka`: Full paragraph starting "„ცაბოს" თეთრი მშრალი ღვინო..."
- `serveTemp`: "10–12°C"
- `alcohol`: "13%"
- `volume`: "750 მლ"

**White wine EN:**
- `longDescription.en`: English translation of the paragraph
- Same `serveTemp`, `alcohol`, `volume` (universal strings)

Red wine gets the same fields populated with equivalent content (keeping parity).

---

## 4. TsabolaWineLightbox Component

File: `src/features/tsabola/components/tsabola-wine-lightbox.tsx`

```
Props:
  wine: WineItem | null
  lang: 'ka' | 'en'
  open: boolean
  onClose: () => void
```

Uses shadcn `Dialog` with customised `DialogContent`:

- Background: `bg-charcoal` (near-black), text: `text-cream`
- Entry animation: shadcn's built-in fade + scale via `tw-animate-css` classes
- Close: X button (top-right) + click-outside (Dialog default behaviour)

**Layout (md+ desktop):** two columns, gap-0

| Left (40%) | Right (60%) |
|---|---|
| `bg-charcoal/80` panel | Scrollable content area |
| Bottle `<img>` centred, max-h-96 | Type badge → wine name → divider |
| Subtle `bg-wine/5` radial behind bottle | Details: grape · region · paragraph · temp · alc · volume |

**Layout (mobile):** stacked — image on top, details below, scrollable

**Details block rendering:**
- "ღვინო: X | ყურძენი: X" → small uppercase label row
- "რეგიონი: X" → secondary label row
- `longDescription` paragraph → normal body text, italic
- Serve temp / Alc / Volume → three inline chips

---

## 5. TsabolaWineCard Update

File: `src/features/tsabola/components/tsabola-wine-card.tsx`

Add prop: `onOpen: (wine: WineItem) => void`

Image wrapper becomes a `<button>` (accessible) with `onClick={() => onOpen(item)}`.
Hover classes applied to the button and inner image.

---

## 6. TsabolaWineCatalog Update

File: `src/features/tsabola/components/tsabola-wine-catalog.tsx`

- Add `useState<WineItem | null>(null)` for `selectedWine`
- Pass `onOpen={setSelectedWine}` to each `TsabolaWineCard`
- Render `<TsabolaWineLightbox wine={selectedWine} lang={lang} open={!!selectedWine} onClose={() => setSelectedWine(null)} />`

---

## 7. File Summary

| Action | File |
|---|---|
| Add keyframes + utility | `src/app/globals.css` |
| Extend type | `src/features/tsabola/types/index.ts` |
| Add content | `src/features/tsabola/content/site-content.ts` |
| New component | `src/features/tsabola/components/tsabola-wine-lightbox.tsx` |
| Update — add prop + hover | `src/features/tsabola/components/tsabola-wine-card.tsx` |
| Update — lifted state | `src/features/tsabola/components/tsabola-wine-catalog.tsx` |

No new folders needed. All files follow existing codebase conventions.

---

## Constraints Honoured

- No inline styles
- No arbitrary Tailwind values `[...]`
- No primitive HTML in page files (not applicable here)
- Both KA and EN updated in site-content.ts
- `type` not `interface` for new types (existing WineItem uses interface — not changed)
