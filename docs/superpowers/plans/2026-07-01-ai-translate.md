# AI Auto-Translate (KA→EN) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-translate Georgian → English for Gallery (`caption`, `description`) and News (`title`, `body`) on save, without ever overwriting an admin's manual English edit.

**Architecture:** A shared `AiTranslator` singleton (`src/shared/lib/`) wraps the OpenRouter call. A pure helper `resolveBilingualField` (`src/shared/utils/`) decides, per bilingual field, whether to call it — based on a small "translation memory" (`{ sourceKa, autoEn }`) stored alongside the field. Gallery and News services call the helper before persisting.

**Tech Stack:** OpenRouter API (`meta-llama/llama-3.3-70b-instruct:free`), native `fetch`, Vitest, Mongoose (Mixed schema for site-content, typed schema for gallery).

**Spec:** `docs/superpowers/specs/2026-07-01-ai-translate-design.md`

## Global Constraints

- Never use `interface` — always `type`.
- Never cast to `unknown` — cast to a named type instead (existing repo pattern: `as Promise<XDocument | null>`).
- Always import via `@/` alias, never `../`.
- Services always return `ServiceResult<T>` (`{ data, status }`), never throw.
- Repositories only run raw Mongoose queries — no conditionals/business logic.
- Every file in `src/shared/lib/` is a class with a singleton export and a co-located `.spec.ts`.
- Test files use `.spec.ts`, co-located with source. Mock at the repository boundary, never mock Mongoose models directly. Use `vi.mock('@/...')` with the `@/` alias.
- Manual English edits are permanent once detected — no re-trigger mechanism in this pass.

---

### Task 1: `AiTranslator` shared lib

**Files:**
- Create: `src/shared/const/ai.const.ts`
- Create: `src/shared/lib/ai-translator.ts`
- Create: `src/shared/lib/ai-translator.spec.ts`
- Modify: `.env.example` (already edited this session — verify present, stage if not)

**Interfaces:**
- Produces: `aiTranslator.translate(text: string): Promise<string | null>` — used by Task 2.
- Produces: `OPENROUTER_API_URL`, `OPENROUTER_MODEL` constants — used only inside `ai-translator.ts`.

- [ ] **Step 1: Create the constants file**

```ts
// src/shared/const/ai.const.ts
export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';
```

- [ ] **Step 2: Write the failing test**

```ts
// src/shared/lib/ai-translator.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { AiTranslator } from './ai-translator';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('AiTranslator', () => {
  let translator: AiTranslator;

  beforeEach(() => {
    translator = new AiTranslator();
    mockFetch.mockReset();
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns translated text on success', async () => {
    mockFetch.mockResolvedValueOnce(
      makeResponse({ choices: [{ message: { content: 'Hello world' } }] })
    );
    const result = await translator.translate('გამარჯობა მსოფლიო');
    expect(result).toBe('Hello world');
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer test-key',
    });
  });

  it('returns null when API key is missing', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', '');
    const result = await translator.translate('text');
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns null for empty input without calling fetch', async () => {
    const result = await translator.translate('   ');
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns null on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({}, 500));
    const result = await translator.translate('text');
    expect(result).toBeNull();
  });

  it('returns null when fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'));
    const result = await translator.translate('text');
    expect(result).toBeNull();
  });

  it('returns null when response has no content', async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({ choices: [] }));
    const result = await translator.translate('text');
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/shared/lib/ai-translator.spec.ts`
Expected: FAIL — `Cannot find module './ai-translator'` (file doesn't exist yet).

- [ ] **Step 4: Write the implementation**

```ts
// src/shared/lib/ai-translator.ts
import { OPENROUTER_API_URL, OPENROUTER_MODEL } from '@/shared/const/ai.const';

type OpenRouterResponse = {
  choices?: { message?: { content?: string } }[];
};

class AiTranslator {
  async translate(text: string): Promise<string | null> {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'Translate the given Georgian text into natural, fluent English. Preserve meaning and formatting. Reply with only the translated text, no notes or quotes.',
            },
            { role: 'user', content: trimmed },
          ],
        }),
      });

      if (!response.ok) return null;

      const data = (await response.json()) as OpenRouterResponse;
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || !content.trim()) return null;

      return content.trim();
    } catch {
      return null;
    }
  }
}

export const aiTranslator = new AiTranslator();
export { AiTranslator };
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/shared/lib/ai-translator.spec.ts`
Expected: PASS — 6 tests.

- [ ] **Step 6: Commit**

```bash
git add src/shared/const/ai.const.ts src/shared/lib/ai-translator.ts src/shared/lib/ai-translator.spec.ts .env.example
git commit -m "feat: add AiTranslator shared lib for OpenRouter translation"
```

---

### Task 2: `resolveBilingualField` helper

**Files:**
- Modify: `src/shared/types/common.ts` — add `TranslationMemory` type
- Create: `src/shared/utils/resolve-bilingual-field.ts`
- Create: `src/shared/utils/resolve-bilingual-field.spec.ts`

**Interfaces:**
- Consumes: `aiTranslator.translate(text: string): Promise<string | null>` (Task 1).
- Produces: `TranslationMemory = { sourceKa: string; autoEn: string }` — used by Tasks 3 and 4.
- Produces: `resolveBilingualField(current: { ka: string; en: string }, memory: { sourceKa?: string; autoEn?: string } | undefined): Promise<{ value: { ka: string; en: string }; memory: TranslationMemory }>` — used by Tasks 3 and 4. Memory param is loosely typed to accept Mongoose subdocuments directly; return memory is always a fully-populated `TranslationMemory`.

- [ ] **Step 1: Add the `TranslationMemory` type**

```ts
// src/shared/types/common.ts
// add to the existing file, alongside ServiceResult/PaginatedResult/ApiErrorResponse:

export type TranslationMemory = {
  sourceKa: string;
  autoEn: string;
};
```

- [ ] **Step 2: Write the failing test**

```ts
// src/shared/utils/resolve-bilingual-field.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/ai-translator', () => ({
  aiTranslator: { translate: vi.fn() },
}));

import { aiTranslator } from '@/shared/lib/ai-translator';

import { resolveBilingualField } from './resolve-bilingual-field';

describe('resolveBilingualField', () => {
  beforeEach(() => {
    vi.mocked(aiTranslator.translate).mockReset();
  });

  it('no-ops when ka is empty', async () => {
    const result = await resolveBilingualField({ ka: '', en: '' }, undefined);
    expect(result).toEqual({ value: { ka: '', en: '' }, memory: { sourceKa: '', autoEn: '' } });
    expect(aiTranslator.translate).not.toHaveBeenCalled();
  });

  it('translates a fresh field with no prior memory', async () => {
    vi.mocked(aiTranslator.translate).mockResolvedValueOnce('Hello');
    const result = await resolveBilingualField({ ka: 'გამარჯობა', en: '' }, undefined);
    expect(result).toEqual({
      value: { ka: 'გამარჯობა', en: 'Hello' },
      memory: { sourceKa: 'გამარჯობა', autoEn: 'Hello' },
    });
  });

  it('retranslates when ka changes and en still matches last auto output', async () => {
    vi.mocked(aiTranslator.translate).mockResolvedValueOnce('Goodbye');
    const result = await resolveBilingualField(
      { ka: 'ნახვამდის', en: 'Hello' },
      { sourceKa: 'გამარჯობა', autoEn: 'Hello' }
    );
    expect(result).toEqual({
      value: { ka: 'ნახვამდის', en: 'Goodbye' },
      memory: { sourceKa: 'ნახვამდის', autoEn: 'Goodbye' },
    });
  });

  it('never overwrites a manually edited en, even if ka changed', async () => {
    const result = await resolveBilingualField(
      { ka: 'ნახვამდის', en: 'Manually written English' },
      { sourceKa: 'გამარჯობა', autoEn: 'Hello' }
    );
    expect(result).toEqual({
      value: { ka: 'ნახვამდის', en: 'Manually written English' },
      memory: { sourceKa: 'გამარჯობა', autoEn: 'Hello' },
    });
    expect(aiTranslator.translate).not.toHaveBeenCalled();
  });

  it('is a no-op when nothing changed', async () => {
    const memory = { sourceKa: 'გამარჯობა', autoEn: 'Hello' };
    const result = await resolveBilingualField({ ka: 'გამარჯობა', en: 'Hello' }, memory);
    expect(result).toEqual({ value: { ka: 'გამარჯობა', en: 'Hello' }, memory });
    expect(aiTranslator.translate).not.toHaveBeenCalled();
  });

  it('keeps old value and memory unchanged so it retries next time when translation fails', async () => {
    vi.mocked(aiTranslator.translate).mockResolvedValueOnce(null);
    const memory = { sourceKa: 'ძველი', autoEn: 'Old' };
    const result = await resolveBilingualField({ ka: 'ახალი', en: 'Old' }, memory);
    expect(result).toEqual({ value: { ka: 'ახალი', en: 'Old' }, memory });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/shared/utils/resolve-bilingual-field.spec.ts`
Expected: FAIL — `Cannot find module './resolve-bilingual-field'`.

- [ ] **Step 4: Write the implementation**

```ts
// src/shared/utils/resolve-bilingual-field.ts
import { aiTranslator } from '@/shared/lib/ai-translator';
import type { TranslationMemory } from '@/shared/types/common';

type BilingualValue = { ka: string; en: string };

// Loosely-typed on purpose: Mongoose's InferSchemaType makes nested schema
// fields optional (see how `caption`/`description` are already accessed with
// `?.` + `??` elsewhere in this codebase), so callers passing a Mongoose
// subdocument won't have a strict TranslationMemory to hand us.
type StoredMemory = { sourceKa?: string; autoEn?: string } | undefined;

export async function resolveBilingualField(
  current: BilingualValue,
  memory: StoredMemory
): Promise<{ value: BilingualValue; memory: TranslationMemory }> {
  const baseline: TranslationMemory = {
    sourceKa: memory?.sourceKa ?? '',
    autoEn: memory?.autoEn ?? '',
  };

  if (!current.ka.trim()) {
    return { value: current, memory: baseline };
  }

  if (current.en !== baseline.autoEn) {
    return { value: current, memory: baseline };
  }

  if (current.ka === baseline.sourceKa) {
    return { value: current, memory: baseline };
  }

  const translated = await aiTranslator.translate(current.ka);
  if (!translated) {
    return { value: current, memory: baseline };
  }

  return {
    value: { ka: current.ka, en: translated },
    memory: { sourceKa: current.ka, autoEn: translated },
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/shared/utils/resolve-bilingual-field.spec.ts`
Expected: PASS — 6 tests.

- [ ] **Step 6: Commit**

```bash
git add src/shared/types/common.ts src/shared/utils/resolve-bilingual-field.ts src/shared/utils/resolve-bilingual-field.spec.ts
git commit -m "feat: add resolveBilingualField translation-memory helper"
```

---

### Task 3: Gallery integration

**Files:**
- Modify: `src/features/gallery/schema/gallery.schema.ts`
- Modify: `src/features/gallery/repository/gallery.repository.ts`
- Modify: `src/features/gallery/service/gallery.service.ts`
- Create: `src/features/gallery/service/gallery.service.spec.ts`

**Interfaces:**
- Consumes: `resolveBilingualField` (Task 2), `GalleryImageDocument` (existing), `galleryRepository.updateById` (existing).
- Produces: `galleryRepository.findById(id: string): Promise<GalleryImageDocument | null>` — new, used only inside `gallery.service.ts`.
- Produces: `GalleryImageDocument` now includes `captionTranslation` and `descriptionTranslation: TranslationMemory`.

- [ ] **Step 1: Add translation-memory fields to the schema**

```ts
// src/features/gallery/schema/gallery.schema.ts
import mongoose, { Schema, InferSchemaType } from 'mongoose';

const GalleryImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    slug: { type: String, required: true, default: '' },
    published: { type: Boolean, required: true, default: true },
    caption: {
      ka: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    description: {
      ka: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    captionTranslation: {
      sourceKa: { type: String, default: '' },
      autoEn: { type: String, default: '' },
    },
    descriptionTranslation: {
      sourceKa: { type: String, default: '' },
      autoEn: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export type GalleryImageDocument = InferSchemaType<typeof GalleryImageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const GalleryImageModel =
  mongoose.models.GalleryImage ||
  mongoose.model('GalleryImage', GalleryImageSchema);
```

- [ ] **Step 2: Add `findById` to the repository**

```ts
// src/features/gallery/repository/gallery.repository.ts
// add this method inside the existing galleryRepository object, after findAll:

  async findById(id: string): Promise<GalleryImageDocument | null> {
    await mongo.connect();
    return GalleryImageModel.findById(id).lean() as Promise<GalleryImageDocument | null>;
  },
```

- [ ] **Step 3: Write the failing service test**

```ts
// src/features/gallery/service/gallery.service.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/gallery/repository/gallery.repository', () => ({
  galleryRepository: {
    findById: vi.fn(),
    updateById: vi.fn(),
  },
}));
vi.mock('@/shared/utils/resolve-bilingual-field', () => ({
  resolveBilingualField: vi.fn(),
}));

import { galleryRepository } from '@/features/gallery/repository/gallery.repository';
import { resolveBilingualField } from '@/shared/utils/resolve-bilingual-field';

import { updateGalleryImage } from './gallery.service';

const BASE_DOC = {
  _id: { toString: () => 'abc123' },
  url: 'https://example.com/a.jpg',
  publicId: 'pub-1',
  slug: 'a',
  published: true,
  caption: { ka: 'ka-old', en: 'en-old' },
  description: { ka: 'd-ka', en: 'd-en' },
  captionTranslation: { sourceKa: 'ka-old', autoEn: 'en-old' },
  descriptionTranslation: { sourceKa: 'd-ka', autoEn: 'd-en' },
  createdAt: new Date(),
};

describe('updateGalleryImage', () => {
  beforeEach(() => {
    vi.mocked(galleryRepository.findById).mockReset();
    vi.mocked(galleryRepository.updateById).mockReset();
    vi.mocked(resolveBilingualField).mockReset();
  });

  it('resolves caption and description translation before saving', async () => {
    vi.mocked(galleryRepository.findById).mockResolvedValueOnce(BASE_DOC as never);
    vi.mocked(resolveBilingualField)
      .mockResolvedValueOnce({ value: { ka: 'ka-new', en: 'en-new' }, memory: { sourceKa: 'ka-new', autoEn: 'en-new' } })
      .mockResolvedValueOnce({ value: { ka: 'd-ka', en: 'd-en' }, memory: { sourceKa: 'd-ka', autoEn: 'd-en' } });
    vi.mocked(galleryRepository.updateById).mockResolvedValueOnce({
      ...BASE_DOC,
      caption: { ka: 'ka-new', en: 'en-new' },
    } as never);

    await updateGalleryImage('abc123', { caption: { ka: 'ka-new', en: 'en-old' } });

    expect(resolveBilingualField).toHaveBeenCalledWith(
      { ka: 'ka-new', en: 'en-old' },
      { sourceKa: 'ka-old', autoEn: 'en-old' }
    );
    const updatePayload = vi.mocked(galleryRepository.updateById).mock.calls[0][1];
    expect(updatePayload.caption).toEqual({ ka: 'ka-new', en: 'en-new' });
    expect(updatePayload.captionTranslation).toEqual({ sourceKa: 'ka-new', autoEn: 'en-new' });
  });

  it('returns NOT_FOUND when image does not exist', async () => {
    vi.mocked(galleryRepository.findById).mockResolvedValueOnce(null);
    const result = await updateGalleryImage('missing', { slug: 'x' });
    expect(result.status).toBe(404);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run src/features/gallery/service/gallery.service.spec.ts`
Expected: FAIL — `galleryRepository.findById is not a function` or similar (service doesn't call it yet).

- [ ] **Step 5: Update the service implementation**

```ts
// src/features/gallery/service/gallery.service.ts
import { galleryRepository } from '@/features/gallery/repository/gallery.repository';
import { GalleryImageDocument } from '@/features/gallery/schema/gallery.schema';
import { GalleryImage } from '@/features/gallery/types/gallery.types';
import { UpdateGalleryImageType } from '@/features/gallery/validations/gallery.validation';
import { ServiceResult } from '@/shared/types/common';
import { resolveBilingualField } from '@/shared/utils/resolve-bilingual-field';
import { slugify } from '@/shared/utils/slugify';

// ...(toGalleryImage, listGalleryImages, listPublishedGalleryImages, getGalleryImageBySlugService,
// addGalleryImage stay unchanged)...

export async function updateGalleryImage(
  id: string,
  data: UpdateGalleryImageType
): Promise<ServiceResult<GalleryImage>> {
  const existing = await galleryRepository.findById(id);
  if (!existing) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const updates: Partial<GalleryImageDocument> = { ...data };

  if (data.caption) {
    const resolved = await resolveBilingualField(data.caption, existing.captionTranslation);
    updates.caption = resolved.value;
    updates.captionTranslation = resolved.memory;
  }

  if (data.description) {
    const resolved = await resolveBilingualField(data.description, existing.descriptionTranslation);
    updates.description = resolved.value;
    updates.descriptionTranslation = resolved.memory;
  }

  const image = await galleryRepository.updateById(id, updates);
  if (!image) return { data: { error: 'NOT_FOUND' }, status: 404 };

  return { data: toGalleryImage(image), status: 200 };
}

// ...(deleteGalleryImage stays unchanged)...
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/features/gallery/service/gallery.service.spec.ts`
Expected: PASS — 2 tests.

- [ ] **Step 7: Run the full suite and build to catch regressions**

Run: `npm run build && npm run test:run`
Expected: build succeeds, all tests pass (existing gallery editor/API-route tests included).

- [ ] **Step 8: Commit**

```bash
git add src/features/gallery/schema/gallery.schema.ts src/features/gallery/repository/gallery.repository.ts src/features/gallery/service/gallery.service.ts src/features/gallery/service/gallery.service.spec.ts
git commit -m "feat: auto-translate gallery caption/description on save"
```

---

### Task 4: News integration (site-content)

**Files:**
- Modify: `src/features/tsabola/types/index.ts`
- Modify: `src/features/tsabola/service/site-content.service.ts`
- Create: `src/features/tsabola/service/site-content.service.spec.ts`

**Interfaces:**
- Consumes: `resolveBilingualField` (Task 2), `siteContentRepository.findOne` / `.upsert` (existing), `NewsItem` (existing, extended below).
- Produces: `NewsItem.titleTranslation?: TranslationMemory`, `NewsItem.bodyTranslation?: TranslationMemory` — no other task depends on these; consumed only within `site-content.service.ts`.

- [ ] **Step 1: Extend the `NewsItem` type**

```ts
// src/features/tsabola/types/index.ts
// add the import at the top:
import type { TranslationMemory } from '@/shared/types/common'

// change the NewsItem type to:
export type NewsItem = {
  id: string
  slug: string
  published: boolean
  title: L
  date: string
  body: L
  image: string
  titleTranslation?: TranslationMemory
  bodyTranslation?: TranslationMemory
}
```

- [ ] **Step 2: Write the failing service test**

```ts
// src/features/tsabola/service/site-content.service.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/tsabola/repository/site-content.repository', () => ({
  siteContentRepository: {
    findOne: vi.fn(),
    upsert: vi.fn(),
  },
}));
vi.mock('@/shared/utils/resolve-bilingual-field', () => ({
  resolveBilingualField: vi.fn(),
}));

import { siteContentRepository } from '@/features/tsabola/repository/site-content.repository';
import { resolveBilingualField } from '@/shared/utils/resolve-bilingual-field';

import { saveSiteContent } from './site-content.service';

function baseContent(newsItems: unknown[]) {
  return {
    site: { name: { ka: '', en: '' }, slogan: { ka: '', en: '' } },
    nav: { wines: { ka: '', en: '' }, gallery: { ka: '', en: '' }, about: { ka: '', en: '' }, contact: { ka: '', en: '' }, news: { ka: '', en: '' } },
    hero: { headline: { ka: '', en: '' }, subline: { ka: '', en: '' }, cta: { ka: '', en: '' }, images: [] },
    wines: [],
    news: { title: { ka: '', en: '' }, subtitle: { ka: '', en: '' }, items: newsItems },
    gallery: { title: { ka: '', en: '' }, subtitle: { ka: '', en: '' }, images: [] },
    about: { title: { ka: '', en: '' }, body: { ka: '', en: '' }, imageAlt: { ka: '', en: '' }, image: '' },
    contact: { title: { ka: '', en: '' }, subtitle: { ka: '', en: '' }, email: '', phone: '', whatsapp: '', address: { ka: '', en: '' } },
    footer: { copy: { ka: '', en: '' } },
  };
}

describe('saveSiteContent', () => {
  beforeEach(() => {
    vi.mocked(siteContentRepository.findOne).mockReset();
    vi.mocked(siteContentRepository.upsert).mockReset();
    vi.mocked(resolveBilingualField).mockReset();
  });

  it('resolves title and body translation for each news item against its previous version', async () => {
    const prevItem = {
      id: 'news-1',
      slug: 'a',
      published: true,
      title: { ka: 'ka-old', en: 'en-old' },
      date: '',
      body: { ka: 'b-ka', en: 'b-en' },
      image: '',
      titleTranslation: { sourceKa: 'ka-old', autoEn: 'en-old' },
      bodyTranslation: { sourceKa: 'b-ka', autoEn: 'b-en' },
    };
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: baseContent([prevItem]),
      theme: {},
      visibility: {},
    } as never);

    const newItem = { ...prevItem, title: { ka: 'ka-new', en: 'en-old' } };
    vi.mocked(resolveBilingualField)
      .mockResolvedValueOnce({ value: { ka: 'ka-new', en: 'en-new' }, memory: { sourceKa: 'ka-new', autoEn: 'en-new' } })
      .mockResolvedValueOnce({ value: { ka: 'b-ka', en: 'b-en' }, memory: { sourceKa: 'b-ka', autoEn: 'b-en' } });
    vi.mocked(siteContentRepository.upsert).mockResolvedValueOnce(undefined as never);

    const payload = { content: baseContent([newItem]), theme: {}, visibility: {} };
    await saveSiteContent(payload);

    expect(resolveBilingualField).toHaveBeenNthCalledWith(
      1,
      { ka: 'ka-new', en: 'en-old' },
      { sourceKa: 'ka-old', autoEn: 'en-old' }
    );
    const upsertArg = vi.mocked(siteContentRepository.upsert).mock.calls[0][0] as { content: { news: { items: { title: unknown }[] } } };
    expect(upsertArg.content.news.items[0].title).toEqual({ ka: 'ka-new', en: 'en-new' });
  });

  it('treats a news item with no previous match as fresh (no memory)', async () => {
    vi.mocked(siteContentRepository.findOne).mockResolvedValueOnce({
      content: baseContent([]),
      theme: {},
      visibility: {},
    } as never);
    vi.mocked(resolveBilingualField)
      .mockResolvedValueOnce({ value: { ka: 'ka-1', en: 'en-1' }, memory: { sourceKa: 'ka-1', autoEn: 'en-1' } })
      .mockResolvedValueOnce({ value: { ka: '', en: '' }, memory: { sourceKa: '', autoEn: '' } });
    vi.mocked(siteContentRepository.upsert).mockResolvedValueOnce(undefined as never);

    const newItem = {
      id: 'news-new',
      slug: '',
      published: true,
      title: { ka: 'ka-1', en: '' },
      date: '',
      body: { ka: '', en: '' },
      image: '',
    };
    await saveSiteContent({ content: baseContent([newItem]), theme: {}, visibility: {} });

    expect(resolveBilingualField).toHaveBeenNthCalledWith(1, { ka: 'ka-1', en: '' }, undefined);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/features/tsabola/service/site-content.service.spec.ts`
Expected: FAIL — assertions on `resolveBilingualField` calls fail (service doesn't call it yet).

- [ ] **Step 4: Update the service implementation**

```ts
// src/features/tsabola/service/site-content.service.ts
import { DEFAULT_CONTENT, DEFAULT_THEME, DEFAULT_VISIBILITY } from '@/features/tsabola/content/site-content';
import { siteContentRepository } from '@/features/tsabola/repository/site-content.repository';
import type { NewsItem, SiteContent } from '@/features/tsabola/types';
import { ServiceResult } from '@/shared/types/common';
import { resolveBilingualField } from '@/shared/utils/resolve-bilingual-field';
import { slugify } from '@/shared/utils/slugify';

type SiteContentPayload = { content: unknown; theme: unknown; visibility: unknown };

function normalizeNewsItem(item: NewsItem): NewsItem {
  const fallbackSlug = slugify(item.title?.en ?? '') || slugify(item.title?.ka ?? '') || item.id;
  return { ...item, slug: item.slug || fallbackSlug, published: item.published ?? true };
}

function normalizeContent(content: SiteContent): SiteContent {
  return { ...content, news: { ...content.news, items: content.news.items.map(normalizeNewsItem) } };
}

async function resolveNewsTranslations(
  items: NewsItem[],
  previousItems: NewsItem[]
): Promise<NewsItem[]> {
  const previousById = new Map(previousItems.map((item) => [item.id, item]));

  return Promise.all(
    items.map(async (item) => {
      const previous = previousById.get(item.id);
      const title = await resolveBilingualField(item.title, previous?.titleTranslation);
      const body = await resolveBilingualField(item.body, previous?.bodyTranslation);
      return {
        ...item,
        title: title.value,
        titleTranslation: title.memory,
        body: body.value,
        bodyTranslation: body.memory,
      };
    })
  );
}

export async function getSiteContent(): Promise<ServiceResult<SiteContentPayload>> {
  const doc = await siteContentRepository.findOne();
  if (!doc) {
    return {
      data: { content: normalizeContent(DEFAULT_CONTENT), theme: DEFAULT_THEME, visibility: DEFAULT_VISIBILITY },
      status: 200,
    };
  }
  return {
    data: {
      content: normalizeContent(doc.content as SiteContent),
      theme: doc.theme,
      visibility: doc.visibility,
    },
    status: 200,
  };
}

export async function saveSiteContent(
  data: SiteContentPayload
): Promise<ServiceResult<SiteContentPayload>> {
  const existingDoc = await siteContentRepository.findOne();
  const previousItems = existingDoc ? (existingDoc.content as SiteContent).news.items : [];

  const content = data.content as SiteContent;
  const translatedItems = await resolveNewsTranslations(content.news.items, previousItems);
  const nextData: SiteContentPayload = {
    ...data,
    content: { ...content, news: { ...content.news, items: translatedItems } },
  };

  await siteContentRepository.upsert(nextData);
  return { data: nextData, status: 200 };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/features/tsabola/service/site-content.service.spec.ts`
Expected: PASS — 2 tests.

- [ ] **Step 6: Run the full suite and build to catch regressions**

Run: `npm run build && npm run test:run`
Expected: build succeeds, all tests pass (including `tsabola-news.test.tsx` and any content-store tests touching `NewsItem`).

- [ ] **Step 7: Commit**

```bash
git add src/features/tsabola/types/index.ts src/features/tsabola/service/site-content.service.ts src/features/tsabola/service/site-content.service.spec.ts
git commit -m "feat: auto-translate news title/body on site-content save"
```

---

## Manual Verification (after Task 4)

1. `npm run dev`, open `/admin`, go to Gallery editor.
2. Set an image's caption KA field to new Georgian text, leave EN blank, save. Reload — EN should now show an AI translation.
3. Manually edit that EN text to something else, save. Change the KA text again, save. Reload — EN should keep your manual edit, not be overwritten.
4. Repeat steps 2-3 for a News item's title/body in the News editor.
5. Temporarily remove `OPENROUTER_API_KEY` from `.env`, restart dev server, save a fresh KA-only field — save should succeed, EN just stays blank (no crash, no 500).
