# AI Auto-Translate (KA→EN) — Gallery + News

## Problem

Admins write content in Georgian first. English fields must stay in sync but manual translation is slow, and any AI translation must never clobber an admin's manual English edit.

## Scope

First pass: **Gallery** (`caption`, `description`) and **News** (`title`, `body`) only. Wines and other `site-content` sections (hero, about, contact, nav) are out of scope — extend later once this pattern is proven.

Not in scope: image cropping, layout optimization (separate future specs).

## Architecture

### `src/shared/lib/ai-translator.ts`

Class `AiTranslator`, singleton export `aiTranslator`. One public method:

```ts
translate(text: string): Promise<string | null>
```

Calls OpenRouter chat completions (`https://openrouter.ai/api/v1/chat/completions`) with model `meta-llama/llama-3.3-70b-instruct:free`. Reads `OPENROUTER_API_KEY` from `process.env` — never hardcoded, never checked into git (`.env` is gitignored). Returns `null` (never throws) when: key missing, input is empty/whitespace, HTTP response not OK, network error, or response has no usable content. Model id and endpoint URL live in `src/shared/const/ai.const.ts`.

Co-located `ai-translator.spec.ts` — mocks global `fetch`, covers: success, missing key, non-200, network throw, empty input.

### `src/shared/utils/resolve-bilingual-field.ts`

Pure-ish async helper (no DB access):

```ts
type TranslationMemory = { sourceKa: string; autoEn: string }

resolveBilingualField(
  current: { ka: string; en: string },
  memory: TranslationMemory | undefined
): Promise<{ value: { ka: string; en: string }; memory: TranslationMemory }>
```

Decision logic:
1. `current.ka` empty → no-op, return `current` and `memory ?? {sourceKa:'', autoEn:''}`.
2. `current.en !== (memory?.autoEn ?? '')` → admin manually edited/pre-filled EN → **never overwrite**, return `current` unchanged, memory **unchanged** (frozen — once manually edited, this field never auto-translates again, per explicit instruction. No re-trigger UI in this pass).
3. Else if `current.ka !== (memory?.sourceKa ?? '')` → KA changed and EN is still untouched AI output (or blank) → call `aiTranslator.translate(current.ka)`.
   - Success → return `{ka: current.ka, en: translated}`, memory `{sourceKa: current.ka, autoEn: translated}`.
   - Failure (`null`) → return `current` unchanged, memory unchanged (so it's retried on the next save).
4. Else nothing changed → return `current` and `memory` unchanged.

`TranslationMemory` type lives in `src/shared/types/common.ts` (generic, reused by both features).

Co-located `resolve-bilingual-field.spec.ts` — mocks `@/shared/lib/ai-translator`, covers all 4 branches above plus the retry-after-failure case.

## Data flow

### Gallery

- `gallery.schema.ts`: add sibling fields `captionTranslation` and `descriptionTranslation`, each `{ sourceKa: String default '', autoEn: String default '' }`.
- `gallery.repository.ts`: add `findById(id)` (needed to read prior memory before diffing).
- `gallery.service.ts` → `updateGalleryImage`:
  1. `existing = await galleryRepository.findById(id)`; 404 if missing.
  2. If `data.caption` present: `resolveBilingualField(data.caption, existing.captionTranslation)` → merge resolved `value`/`memory` into the update payload.
  3. Same for `data.description`.
  4. `galleryRepository.updateById(id, updates)` as before.
- No Zod validation changes — translation memory is server-computed, never client input.
- Public `GalleryImage` type/mapping unchanged; memory fields stay internal to the DB document.

### News

- `NewsItem` type (`tsabola/types/index.ts`) gets optional `titleTranslation?: TranslationMemory` and `bodyTranslation?: TranslationMemory`. No schema migration needed — `SiteContent.content` is `Schema.Types.Mixed`.
- `site-content.service.ts` → `saveSiteContent`:
  1. Fetch existing doc via `siteContentRepository.findOne()`.
  2. Build a `Map` of previous news items by `id`.
  3. For each incoming `content.news.items[i]`, look up its previous counterpart (if any) and run `resolveBilingualField` for `title` and `body`, writing resolved `value`/`memory` back onto the item.
  4. Persist the transformed `content` via `siteContentRepository.upsert`.
  5. All other `SiteContent` sections (hero, wines, about, contact, nav, site, footer) pass through untouched.

## Error handling

AI unavailable (no key, rate-limited free model, network blip) → translation step is a no-op, save proceeds with whatever EN existed before, and is retried automatically on the next save once KA differs from stored memory again (since `sourceKa` never got updated on failure). Nothing user-facing breaks.

## Testing

- `ai-translator.spec.ts` (new)
- `resolve-bilingual-field.spec.ts` (new)
- No changes required to existing spec files (no prior tests cover gallery/site-content services).

## Config

- `.env` / `.env.example`: add `OPENROUTER_API_KEY`. `.env` already holds live secrets (Mongo, Cloudinary) and is gitignored — same pattern.
