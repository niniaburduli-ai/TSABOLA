# Hero Image Framing & Admin Position Control — Design Spec

## Summary

Fix hero images cropping badly on mobile (emblem/subject cut off), give admins
per-image control over the crop framing, fix the mobile headline clipping off
both edges, and let visitors tap a hero image to see it uncropped.

---

## 1. Data Model

File: `src/features/tsabola/types/index.ts`

`hero.images` changes from `string[]` to an array of objects carrying a
device-specific crop position:

```ts
export type HeroImagePosition = 'top' | 'center' | 'bottom'

export type HeroImage = {
  src: string
  positionMobile: HeroImagePosition
  positionDesktop: HeroImagePosition
}
```

`SiteContent['hero']` becomes:

```ts
hero: { headline: L; subline: L; cta: L; images: HeroImage[] }
```

Only two positions per image (mobile, desktop) — not per-breakpoint beyond
that — matching the agreed design (desktop's crop window is close to the
source aspect and forgiving; mobile's is much thinner and needs its own
tuning).

---

## 2. Content Defaults

File: `src/features/tsabola/content/site-content.ts`

Update `DEFAULT_CONTENT.hero.images` to the new shape for the two existing
default images:

```ts
images: [
  { src: '.../hero-rtveli.png', positionMobile: 'top', positionDesktop: 'center' },
  { src: '.../hero-venaxi.png', positionMobile: 'top', positionDesktop: 'center' },
]
```

(`positionDesktop: 'center'` here, not `'top'` — desktop's crop window is
close to the source aspect already, so `'center'` is the safer starting
point for these two specific images; §3's `'top'`/`'top'` default is only
for the automatic string→object migration path, where nothing is known
about the photo.)

---

## 3. Backward Compatibility

File: `src/features/tsabola/service/site-content.service.ts`

Live Mongo docs still have `hero.images` as `string[]` from before this
change. `getSiteContent()` already runs every document through
`normalizeContent()` before returning it (same spot `normalizeNewsItem` runs).
Add a sibling normalizer:

```ts
function normalizeHeroImage(image: unknown): HeroImage {
  if (typeof image === 'string') {
    return { src: image, positionMobile: 'top', positionDesktop: 'top' }
  }
  return image as HeroImage
}
```

Called from `normalizeContent` as
`hero: { ...content.hero, images: content.hero.images.map(normalizeHeroImage) }`.

Migrated images default to `'top'` on both breakpoints — not `'center'` —
because `'top'` is the actual fix for the emblem-cutoff bug already live in
prod. This makes already-uploaded photos correct immediately, with no admin
action required; the admin can still fine-tune per image afterward.

No Mongoose schema change needed — `content` is `Schema.Types.Mixed`.

---

## 4. Hero Rendering

File: `src/features/tsabola/components/tsabola-hero.tsx`

Replace the single global `.hero-img-pos` CSS class with a literal Tailwind
class lookup (dynamically-interpolated class names aren't picked up by
Tailwind's static scanner, so this must stay literal per entry):

```ts
const MOBILE_POSITION_CLASS: Record<HeroImagePosition, string> = {
  top: 'object-top',
  center: 'object-center',
  bottom: 'object-bottom',
}

const DESKTOP_POSITION_CLASS: Record<HeroImagePosition, string> = {
  top: 'sm:object-top',
  center: 'sm:object-center',
  bottom: 'sm:object-bottom',
}
```

Each image's `className` becomes:
```
object-cover {MOBILE_POSITION_CLASS[image.positionMobile]} {DESKTOP_POSITION_CLASS[image.positionDesktop]}
```

`images` is now `HeroImage[]`; update the `.map` and the fallback array
(`['/TSABO WHITE.png', '/TSABO RED.png']`) to the new object shape.

**Headline fix** — on the `h1`:
- remove `whitespace-nowrap`
- add `max-w-xs text-balance sm:max-w-none sm:whitespace-nowrap`

Mobile wraps within a width matching the subline below it; desktop keeps
today's single-line behaviour (already fits fine there).

**Click-to-expand lightbox** — the active image becomes clickable:
- hero gets local state `const [lightboxOpen, setLightboxOpen] = useState(false)`
- clicking the visible image slide sets it `true` and pauses the
  `setInterval` auto-rotate (skip re-arming the interval while open)
- renders `<TsabolaLightbox images={images.map(i => i.src)} index={active} onClose={...} onPrev={...} onNext={...} />`
  when open, reusing the existing component as-is (no changes needed there)

---

## 5. Admin Editor

File: `src/features/tsabola/admin/editors/hero-editor.tsx`

Each image row gains two small `Select` controls (shadcn `Select`, already
used elsewhere in admin), labeled "მობილურზე" (mobile) / "დესქტოპზე"
(desktop), options Top/Center/Bottom in Georgian
(ზედა/ცენტრი/ქვედა). Changing either calls `updateImage` with the same
image's `src` unchanged and the new position value.

`updateImage`, `addImage` signatures adjust from `string` to `HeroImage` to
match the new array element type.

---

## 6. globals.css Cleanup

Remove the now-unused `.hero-img-pos` rule and its `@media (max-width: 768px)`
override (added in the previous session, superseded by per-image Tailwind
classes). The `@utility h-hero { height: 88vh }` custom utility from the
previous session is untouched.

---

## 7. File Summary

| Action | File |
|---|---|
| Extend/change type | `src/features/tsabola/types/index.ts` |
| Update defaults | `src/features/tsabola/content/site-content.ts` |
| Add normalizer | `src/features/tsabola/service/site-content.service.ts` |
| Update rendering, headline, lightbox | `src/features/tsabola/components/tsabola-hero.tsx` |
| Add position controls | `src/features/tsabola/admin/editors/hero-editor.tsx` |
| Remove dead CSS | `src/app/globals.css` |

No new folders. `TsabolaLightbox` is reused unchanged.

---

## Constraints Honoured

- No inline styles
- No arbitrary Tailwind values `[...]` — only stock `object-top/center/bottom`
  presets, looked up from a literal map (not string-interpolated into the
  class name)
- `type`, not `interface`, for the new `HeroImage`/`HeroImagePosition` types
- Both KA and EN unaffected (position fields are not bilingual content)
- Repository/service boundaries respected — normalization is a service-layer
  concern, not a repository one
