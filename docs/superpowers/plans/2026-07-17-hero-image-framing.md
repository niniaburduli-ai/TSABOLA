# Hero Image Framing & Admin Position Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each hero image its own admin-editable mobile/desktop crop position, fix the mobile headline text getting clipped off both edges, and let visitors tap a hero image to see it uncropped in the existing lightbox.

**Architecture:** `hero.images` moves from `string[]` to `HeroImage[]` (`{ src, positionMobile, positionDesktop }`). Positions map to Tailwind's built-in `object-top/center/bottom` utilities via a literal lookup table (never string-interpolated into a class name, so Tailwind's static scanner still finds them). A service-layer normalizer upgrades any legacy `string[]` doc already in Mongo to the new shape on read, defaulting to `'top'`/`'top'` — the actual fix for the emblem-cutoff bug already live in prod. The existing generic `TsabolaLightbox` component (already used for gallery/wine images) is reused unchanged for the hero click-to-expand.

**Tech Stack:** Next.js 16 App Router, TypeScript (strict, `type` not `interface`), Tailwind CSS v4, Zustand, Vitest + @testing-library/react, Mongoose (`Schema.Types.Mixed` content — no schema migration needed).

## Global Constraints

- No inline styles (`style` prop) anywhere.
- No arbitrary Tailwind values (`[...]` bracket syntax) — only stock utilities.
- Files live in their existing designated folders — no new folders.
- `type`, not `interface`, for all new TypeScript types.
- Repositories only run raw queries; normalization logic belongs in the service layer.
- `@/` import alias for cross-directory imports; `./` only for same-directory.
- Both KA and EN content stay in sync wherever bilingual (`L`) fields are touched — not applicable here since position fields aren't bilingual.

---

### Task 1: Data model — `HeroImage` type and defaults

**Files:**
- Modify: `src/features/tsabola/types/index.ts:32`
- Modify: `src/features/tsabola/content/site-content.ts:22-26`

**Interfaces:**
- Produces: `HeroImagePosition = 'top' | 'center' | 'bottom'`, `HeroImage = { src: string; positionMobile: HeroImagePosition; positionDesktop: HeroImagePosition }`, and `SiteContent['hero']['images']: HeroImage[]` — every later task consumes these exact names and fields.

- [ ] **Step 1: Update the type definitions**

In `src/features/tsabola/types/index.ts`, replace line 32:

```ts
  hero: { headline: L; subline: L; cta: L; images: string[] }
```

with:

```ts
  hero: { headline: L; subline: L; cta: L; images: HeroImage[] }
```

Add these two new exported types directly above the `SiteContent` type (i.e. above what is currently line 29, `export type SiteContent = {`):

```ts
export type HeroImagePosition = 'top' | 'center' | 'bottom'

export type HeroImage = {
  src: string
  positionMobile: HeroImagePosition
  positionDesktop: HeroImagePosition
}

```

- [ ] **Step 2: Update the default content**

In `src/features/tsabola/content/site-content.ts`, replace lines 22-26:

```ts
    images: [
      'https://res.cloudinary.com/dm8ksdiiq/image/upload/v1782764139/tsabola/hero/hero-rtveli.png',
      'https://res.cloudinary.com/dm8ksdiiq/image/upload/v1782764150/tsabola/hero/hero-venaxi.png',
      '',
    ],
```

with:

```ts
    images: [
      {
        src: 'https://res.cloudinary.com/dm8ksdiiq/image/upload/v1782764139/tsabola/hero/hero-rtveli.png',
        positionMobile: 'top',
        positionDesktop: 'center',
      },
      {
        src: 'https://res.cloudinary.com/dm8ksdiiq/image/upload/v1782764150/tsabola/hero/hero-venaxi.png',
        positionMobile: 'top',
        positionDesktop: 'center',
      },
      { src: '', positionMobile: 'center', positionDesktop: 'center' },
    ],
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`

Expected: this fails right now (many call sites still expect `string[]`) — that's expected at this point in the plan. Confirm the errors are limited to: `site-content.service.ts` (normalizeContent), `tsabola-hero.tsx`, `hero-editor.tsx`. If any other file errors, stop and investigate before continuing — it means something outside this plan's scope touches `hero.images`.

- [ ] **Step 4: Commit**

```bash
git add src/features/tsabola/types/index.ts src/features/tsabola/content/site-content.ts
git commit -m "feat: add HeroImage type with per-device crop position"
```

---

### Task 2: Backward-compat normalization for legacy hero images

**Files:**
- Modify: `src/features/tsabola/service/site-content.service.ts`
- Test: `src/features/tsabola/service/site-content.service.spec.ts`

**Interfaces:**
- Consumes: `HeroImage` from Task 1 (`src/features/tsabola/types`).
- Produces: `getSiteContent()` now returns `hero.images` always as `HeroImage[]`, whether the underlying Mongo doc has old `string[]` or new `HeroImage[]`. No new exports — this is an internal normalization added to the existing `normalizeContent` pipeline.

- [ ] **Step 1: Write the failing tests**

Add to the bottom of `src/features/tsabola/service/site-content.service.spec.ts` (add `getSiteContent` to the existing import from `./site-content.service`, and add `import type { SiteContent } from '@/features/tsabola/types';` at the top):

```ts
import type { SiteContent } from '@/features/tsabola/types';

import { getSiteContent, saveSiteContent } from './site-content.service';
```

Then add a new `describe` block:

```ts
describe('getSiteContent', () => {
  beforeEach(() => {
    vi.mocked(siteContentRepository.findOne).mockReset();
  });

  const baseContent = {
    hero: { headline: { ka: '', en: '' }, subline: { ka: '', en: '' }, cta: { ka: '', en: '' }, images: [] as unknown[] },
    news: { title: { ka: '', en: '' }, subtitle: { ka: '', en: '' }, items: [] },
  };

  it('migrates legacy string hero images to objects defaulting to top/top', async () => {
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: { ...baseContent, hero: { ...baseContent.hero, images: ['/a.jpg', '/b.jpg'] } },
      theme: {},
      visibility: {},
    });

    const result = await getSiteContent();

    expect((result.data.content as SiteContent).hero.images).toEqual([
      { src: '/a.jpg', positionMobile: 'top', positionDesktop: 'top' },
      { src: '/b.jpg', positionMobile: 'top', positionDesktop: 'top' },
    ]);
  });

  it('leaves already-migrated hero image objects untouched', async () => {
    const images = [{ src: '/a.jpg', positionMobile: 'center', positionDesktop: 'bottom' }];
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: { ...baseContent, hero: { ...baseContent.hero, images } },
      theme: {},
      visibility: {},
    });

    const result = await getSiteContent();

    expect((result.data.content as SiteContent).hero.images).toEqual(images);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/features/tsabola/service/site-content.service.spec.ts`

Expected: the two new tests FAIL — either a type error on `HeroImage`/`positionMobile` not existing on the legacy string, or an assertion mismatch (`toEqual` receiving `['/a.jpg', '/b.jpg']` unchanged instead of the migrated objects).

- [ ] **Step 3: Implement the normalizer**

In `src/features/tsabola/service/site-content.service.ts`, change the type import line from:

```ts
import type { NewsItem, SiteContent } from '@/features/tsabola/types';
```

to:

```ts
import type { HeroImage, NewsItem, SiteContent } from '@/features/tsabola/types';
```

Add this function next to `normalizeNewsItem`:

```ts
function normalizeHeroImage(image: unknown): HeroImage {
  if (typeof image === 'string') {
    return { src: image, positionMobile: 'top', positionDesktop: 'top' };
  }
  return image as HeroImage;
}
```

Replace `normalizeContent`:

```ts
function normalizeContent(content: SiteContent): SiteContent {
  return {
    ...content,
    hero: { ...content.hero, images: content.hero.images.map(normalizeHeroImage) },
    news: { ...content.news, items: content.news.items.map(normalizeNewsItem) },
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/features/tsabola/service/site-content.service.spec.ts`

Expected: PASS (all tests in the file, including the two new ones and the pre-existing `saveSiteContent` tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/tsabola/service/site-content.service.ts src/features/tsabola/service/site-content.service.spec.ts
git commit -m "fix: migrate legacy string hero images to positioned objects on read"
```

---

### Task 3: Hero rendering — per-image position, headline wrap, click-to-expand

**Files:**
- Modify: `src/features/tsabola/components/tsabola-hero.tsx`
- Modify: `src/app/globals.css`
- Test: `src/features/tsabola/components/__tests__/tsabola-hero.test.tsx` (new)

**Interfaces:**
- Consumes: `HeroImage`, `HeroImagePosition` (Task 1), `TsabolaLightbox` (existing, unchanged — props `{ images: string[]; index: number; onClose: () => void; onPrev: () => void; onNext: () => void }`).
- Produces: no new exports — `TsabolaHero` stays the default export, same call sites.

- [ ] **Step 1: Write the failing tests**

Create `src/features/tsabola/components/__tests__/tsabola-hero.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '../../content/site-content'
import { useContentStore } from '../../store/content-store'
import { useLanguageStore } from '../../store/language-store'
import { TsabolaHero } from '../tsabola-hero'

const HERO_IMAGES = [
  { src: '/hero/one.jpg', positionMobile: 'top' as const, positionDesktop: 'center' as const },
  { src: '/hero/two.jpg', positionMobile: 'bottom' as const, positionDesktop: 'top' as const },
  { src: '', positionMobile: 'center' as const, positionDesktop: 'center' as const },
]

beforeEach(() => {
  useLanguageStore.setState({ lang: 'ka' })
  useContentStore.setState({
    content: { ...DEFAULT_CONTENT, hero: { ...DEFAULT_CONTENT.hero, images: HERO_IMAGES } },
    theme: DEFAULT_THEME,
    visibility: DEFAULT_VISIBILITY,
  })
})

describe('TsabolaHero', () => {
  it('filters out images with an empty src', () => {
    const { container } = render(<TsabolaHero />)
    expect(container.querySelectorAll('img').length).toBe(2)
  })

  it("applies each image's mobile and desktop position classes", () => {
    const { container } = render(<TsabolaHero />)
    const images = container.querySelectorAll('img')
    expect(images[0].className).toContain('object-top')
    expect(images[0].className).toContain('sm:object-center')
    expect(images[1].className).toContain('object-bottom')
    expect(images[1].className).toContain('sm:object-top')
  })

  it('wraps the headline on mobile instead of clipping it', () => {
    render(<TsabolaHero />)
    const headline = screen.getByRole('heading', { level: 1 })
    expect(headline.className).not.toContain('whitespace-nowrap')
    expect(headline.className).toContain('sm:whitespace-nowrap')
  })

  it('opens the lightbox when the hero image is clicked', () => {
    render(<TsabolaHero />)
    fireEvent.click(screen.getByRole('button', { name: 'ფოტოს სრულად ნახვა' }))
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('closes the lightbox when close is clicked', () => {
    render(<TsabolaHero />)
    fireEvent.click(screen.getByRole('button', { name: 'ფოტოს სრულად ნახვა' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })

  it('pauses auto-rotate while the lightbox is open', () => {
    vi.useFakeTimers()
    const { container } = render(<TsabolaHero />)
    fireEvent.click(screen.getByRole('button', { name: 'ფოტოს სრულად ნახვა' }))
    vi.advanceTimersByTime(6000)
    const images = container.querySelectorAll('img')
    expect(images[0].parentElement?.className).toContain('opacity-100')
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/features/tsabola/components/__tests__/tsabola-hero.test.tsx`

Expected: FAIL — `images.length` is 3 not 2 (no filtering by object `src` yet, or a crash since `.filter(Boolean)` on objects is always truthy), no `object-top`/`sm:object-center` classes exist yet, headline still has `whitespace-nowrap` with no `sm:` variant, and there is no button named `'ფოტოს სრულად ნახვა'` at all.

- [ ] **Step 3: Rewrite the component**

Replace the full contents of `src/features/tsabola/components/tsabola-hero.tsx`:

```tsx
'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { useLang } from '../hooks/use-lang'
import type { HeroImage, HeroImagePosition } from '../types'
import { TsabolaLightbox } from './tsabola-lightbox'

const SLIDE_DURATION = 6000

const FALLBACK_IMAGES: HeroImage[] = [
  { src: '/TSABO WHITE.png', positionMobile: 'center', positionDesktop: 'center' },
  { src: '/TSABO RED.png', positionMobile: 'center', positionDesktop: 'center' },
]

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

export function TsabolaHero() {
  const { t, r } = useLang()
  const [active, setActive] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const images: HeroImage[] = (() => {
    const filtered = (t.hero.images ?? []).filter((image): image is HeroImage => Boolean(image?.src))
    return filtered.length >= 1 ? filtered : FALLBACK_IMAGES
  })()

  useEffect(() => {
    if (lightboxOpen) return
    const id = setInterval(() => {
      setActive(prev => (prev + 1) % images.length)
    }, SLIDE_DURATION)
    return () => clearInterval(id)
  }, [images.length, lightboxOpen])

  return (
    <section id="hero" className="relative w-full h-80 sm:h-hero overflow-hidden bg-charcoal">
      {/* Image slides — crossfade */}
      {images.map((image, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={image.src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={`object-cover ${MOBILE_POSITION_CLASS[image.positionMobile]} ${DESKTOP_POSITION_CLASS[image.positionDesktop]}`}
          />
        </div>
      ))}

      {/* Click-to-expand overlay for the currently visible slide */}
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label="ფოტოს სრულად ნახვა"
        className="absolute inset-0 cursor-zoom-in"
      />

      {/* Bottom vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

      {/* Text content — bottom center, compact */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center text-center px-6 pb-6">
        <p className="animate-rise text-cream/50 text-sm tracking-widest uppercase mb-2 font-heading">
          {r(t.site.name)}
        </p>
        <h1 className="animate-rise animate-rise-1 text-cream text-base sm:text-lg font-heading font-semibold leading-snug mb-1 max-w-xs text-balance sm:max-w-none sm:whitespace-nowrap">
          {r(t.hero.headline)}
        </h1>
        <p className="animate-rise animate-rise-2 text-cream/55 text-xs font-sans leading-relaxed mb-4 max-w-xs">
          {r(t.hero.subline)}
        </p>
        <a
          href="#wines"
          className={[
            'animate-rise animate-rise-3 px-5 py-2 border border-cream/35',
            'text-cream text-xs font-heading tracking-wide pointer-events-auto',
            'hover:bg-cream hover:text-charcoal transition-colors duration-300',
          ].join(' ')}
        >
          {r(t.hero.cta)}
        </a>
      </div>

      {/* Slide indicators — right side, vertical stack */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="group flex items-center justify-center px-2 py-1 pointer-events-auto"
          >
            <span
              className={`block w-px transition-all duration-500 ease-in-out ${
                i === active
                  ? 'h-8 bg-white'
                  : 'h-3 bg-white/35 group-hover:bg-white/60'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Scroll cue — bottom-right */}
      <a
        href="#wines"
        className="absolute bottom-6 right-6 z-10 flex flex-col items-center text-white/40 hover:text-white/70 transition-colors duration-300"
        aria-label="Scroll to wines"
      >
        <svg width="12" height="20" viewBox="0 0 14 22" fill="none" className="animate-bounce">
          <path
            d="M7 0v18M1 12l6 6 6-6"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>

      {lightboxOpen && (
        <TsabolaLightbox
          images={images.map(image => image.src)}
          index={active}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setActive(prev => (prev - 1 + images.length) % images.length)}
          onNext={() => setActive(prev => (prev + 1) % images.length)}
        />
      )}
    </section>
  )
}
```

- [ ] **Step 4: Remove the now-dead CSS**

In `src/app/globals.css`, delete this block (currently around line 237-245):

```css
  /* Hero image positioning — frames basket/table foreground */
  .hero-img-pos {
    object-position: center 40%;
  }
  @media (max-width: 768px) {
    .hero-img-pos {
      object-position: center 35%;
    }
  }

```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/features/tsabola/components/__tests__/tsabola-hero.test.tsx`

Expected: PASS (all 6 tests).

- [ ] **Step 6: Type-check the whole project**

Run: `npx tsc --noEmit`

Expected: no errors remaining from `tsabola-hero.tsx` or `globals.css`-related files. `hero-editor.tsx` will still error — that's Task 4.

- [ ] **Step 7: Commit**

```bash
git add src/features/tsabola/components/tsabola-hero.tsx src/features/tsabola/components/__tests__/tsabola-hero.test.tsx src/app/globals.css
git commit -m "feat: per-image hero crop position, mobile headline wrap, click-to-expand lightbox"
```

---

### Task 4: Admin editor — per-image position controls

**Files:**
- Modify: `src/features/tsabola/admin/editors/hero-editor.tsx`

**Interfaces:**
- Consumes: `HeroImage`, `HeroImagePosition` (Task 1); shadcn `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue` from `@/shared/components/ui/select` (existing, used the same way in `src/features/tsabola/admin/theme-editor.tsx:91-105`).
- Produces: no new exports — `HeroEditor` stays the default export.

No automated test for this file — no admin editor in this codebase has component-level tests today (verified: `find src/features/tsabola/admin -iname "*.test.tsx"` returns nothing); this task follows that existing convention and is verified manually in Step 4.

- [ ] **Step 1: Replace the component**

Replace the full contents of `src/features/tsabola/admin/editors/hero-editor.tsx`:

```tsx
'use client'

import { ImageUploadButton } from '@/features/tsabola/components/image-upload-button'
import type { HeroImage, HeroImagePosition } from '@/features/tsabola/types'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'

import { BilingualField } from './_bilingual-field'
import { useContentStore } from '../../store/content-store'

const POSITION_LABEL: Record<HeroImagePosition, string> = {
  top: 'ზედა',
  center: 'ცენტრი',
  bottom: 'ქვედა',
}

export function HeroEditor() {
  const { content, updateSection } = useContentStore()
  const { hero } = content

  const update = (key: keyof typeof hero) => (val: typeof hero[typeof key]) =>
    updateSection('hero', { ...hero, [key]: val })

  const patchImage = (index: number, patch: Partial<HeroImage>) => {
    const images = hero.images.map((image, i) => (i === index ? { ...image, ...patch } : image))
    updateSection('hero', { ...hero, images })
  }

  const addImage = () => {
    const image: HeroImage = { src: '', positionMobile: 'center', positionDesktop: 'center' }
    updateSection('hero', { ...hero, images: [...hero.images, image] })
  }

  const removeImage = (index: number) => {
    const images = hero.images.filter((_, i) => i !== index)
    updateSection('hero', { ...hero, images })
  }

  return (
    <div className="max-w-xl space-y-8">
      <h2 className="font-display text-2xl font-bold text-charcoal">მთავარი ბანერი</h2>
      <BilingualField label="სათაური" value={hero.headline} onChange={update('headline')} />
      <BilingualField label="ქვესათაური" value={hero.subline} onChange={update('subline')} />
      <BilingualField label="CTA ღილაკი" value={hero.cta} onChange={update('cta')} />

      <div className="space-y-4">
        <Label className="text-sm font-medium text-charcoal/70">მთავარი სურათები</Label>
        {hero.images.map((image, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-charcoal/50">სურათი {i + 1}</Label>
              {hero.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  წაშლა
                </button>
              )}
            </div>
            <Input
              value={image.src}
              onChange={(e) => patchImage(i, { src: e.target.value })}
              placeholder="/hero/image.jpg"
            />
            <ImageUploadButton
              folder="tsabola/hero"
              onUpload={(url) => patchImage(i, { src: url })}
              aspectRatio={16 / 9}
            />
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-charcoal/50">მობილურზე</Label>
                <Select
                  value={image.positionMobile}
                  onValueChange={(v) => patchImage(i, { positionMobile: v as HeroImagePosition })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">{POSITION_LABEL.top}</SelectItem>
                    <SelectItem value="center">{POSITION_LABEL.center}</SelectItem>
                    <SelectItem value="bottom">{POSITION_LABEL.bottom}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs text-charcoal/50">დესქტოპზე</Label>
                <Select
                  value={image.positionDesktop}
                  onValueChange={(v) => patchImage(i, { positionDesktop: v as HeroImagePosition })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">{POSITION_LABEL.top}</SelectItem>
                    <SelectItem value="center">{POSITION_LABEL.center}</SelectItem>
                    <SelectItem value="bottom">{POSITION_LABEL.bottom}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addImage}
          className="w-full"
        >
          + სურათის დამატება
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check the whole project**

Run: `npx tsc --noEmit`

Expected: no errors anywhere (this was the last remaining `string[]`-typed call site from Task 1).

- [ ] **Step 3: Run the full test suite**

Run: `npm run test:cov`

Expected: all tests pass, including the ones from Tasks 2 and 3.

- [ ] **Step 4: Manual verification in the admin panel**

```bash
npm run dev
```

Open `http://localhost:3000/admin` (or whatever port it starts on — check the terminal output), log in, go to the hero section editor, and confirm:
- each image row shows two selects ("მობილურზე" / "დესქტოპზე") next to its URL field
- changing a select and clicking save persists (reload the page, the choice sticks)
- adding a new image row defaults both selects to "ცენტრი"

Then open the public site on a narrow viewport (browser dev tools mobile emulation or an actual phone) and confirm the emblem/logo in the hero photo is no longer cut off, the headline wraps instead of clipping, and tapping the hero photo opens it full-size with working close/prev/next.

- [ ] **Step 5: Commit**

```bash
git add src/features/tsabola/admin/editors/hero-editor.tsx
git commit -m "feat: per-image mobile/desktop position controls in hero admin editor"
```

---

## Post-Plan Notes

- The three pre-existing untracked/uncommitted PWA files noted in the prior session (`next.config.ts`, `layout.tsx`, `app.const.ts`, `manifest.ts`, etc.) are unrelated to this plan and were already committed and pushed separately — no action needed here.
- After all four tasks are committed, push to `origin/main` only if the user asks for it (per this repo's standing rule: never push without an explicit request) — Vercel auto-deploys `main`.
