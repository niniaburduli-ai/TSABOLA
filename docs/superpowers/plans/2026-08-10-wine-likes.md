# Wine Likes (Heart) Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let visitors heart a wine on the public catalog/lightbox; show the live count next to the heart; show every product ranked by like count as a bar chart on the admin dashboard.

**Architecture:** New `wine-likes` feature (schema/repository/service/validation only — one Mongo collection, one counter doc per wine, no per-visitor identity). Public API exposes toggle + counts endpoints. Client tracks "did I like this" only in `localStorage` (no cookies, no accounts). A plain Zustand `create()` store (matching this repo's `content-store.ts`/`language-store.ts` pattern, not the context+provider pattern) holds counts + liked-ids for the whole wine grid. Admin dashboard gets a new join (all wines, including zero-like ones) rendered as a simple Tailwind bar chart.

**Tech Stack:** Next.js App Router route handlers, Mongoose, Zod, Zustand (plain `create()`), Vitest, lucide-react `Heart` icon.

## Global Constraints

- No per-visitor/voter identity anywhere — not a goal, explicitly rejected. Only an aggregate counter per wine.
- No hard cap on the dashboard chart — it must always show every current wine, not a fixed top-N. New wines added later must appear automatically.
- `wineId` (the join key for likes) is `WineItem.id` from `content.wines.items`. `wines-editor.tsx` currently mints ids as `wine-${items.length + 1}`, which can collide after a delete + re-add and silently misattribute an old like count to a new wine — fixed in Task 6.
- No inline styles, no arbitrary Tailwind values (CLAUDE.md §0) — stick to the standard scale everywhere below.
- Repositories: raw Mongo queries only, no conditionals beyond query filters (CLAUDE.md §8). Services: always `ServiceResult<T>`, never throw for handled cases (CLAUDE.md §7).
- Style convention actually in force in this repo (verified by reading existing files): `schema/`, `repository/`, `service/`, `validations/`, and everything under `src/app/api/` use semicolons; `.tsx` components, `hooks/`, and `store/` files under `src/features/tsabola/` do not. Follow whichever convention matches each file's location below.
- Dashboard chart color: reuse the existing `--color-wine` token (`bg-wine`, already used everywhere in admin) — no new palette.

---

### Task 1: Wine-like schema + repository

**Files:**
- Create: `src/features/wine-likes/schema/wine-like.schema.ts`
- Create: `src/features/wine-likes/repository/wine-like.repository.ts`
- Test: `src/features/wine-likes/repository/wine-like.repository.spec.ts`

**Interfaces:**
- Produces: `WineLikeDocument = { wineId: string; count: number; _id: ObjectId; createdAt: Date; updatedAt: Date }`, `wineLikeRepository.incrementLike(wineId: string): Promise<WineLikeDocument>`, `wineLikeRepository.decrementLike(wineId: string): Promise<WineLikeDocument | null>`, `wineLikeRepository.getCounts(): Promise<WineLikeDocument[]>`, `wineLikeRepository.getAllSorted(): Promise<WineLikeDocument[]>`

- [ ] **Step 1: Write the schema**

```ts
// src/features/wine-likes/schema/wine-like.schema.ts
import mongoose, { Schema, InferSchemaType } from 'mongoose';

const WineLikeSchema = new Schema(
  {
    wineId: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export type WineLikeDocument = InferSchemaType<typeof WineLikeSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const WineLikeModel =
  mongoose.models.WineLike || mongoose.model('WineLike', WineLikeSchema);
```

No test for this file — matches the existing convention (`user.schema.ts`, `site-content.schema.ts` have no `.spec.ts`).

- [ ] **Step 2: Write the failing repository test**

```ts
// src/features/wine-likes/repository/wine-like.repository.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/mongo', () => ({
  mongo: { connect: vi.fn() },
}));

vi.mock('@/features/wine-likes/schema/wine-like.schema', () => ({
  WineLikeModel: {
    findOneAndUpdate: vi.fn(),
    find: vi.fn(),
  },
}));

import { WineLikeModel } from '@/features/wine-likes/schema/wine-like.schema';
import { mongo } from '@/shared/lib/mongo';

import { wineLikeRepository } from './wine-like.repository';

const mockMongo = vi.mocked(mongo);
const mockModel = vi.mocked(WineLikeModel);

function makeLeanQuery<T>(result: T) {
  return { lean: () => Promise.resolve(result) };
}

describe('wineLikeRepository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('incrementLike connects and upserts with $inc', async () => {
    (mockModel.findOneAndUpdate as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      makeLeanQuery({ wineId: 'wine-1', count: 1 })
    );
    const result = await wineLikeRepository.incrementLike('wine-1');
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
      { wineId: 'wine-1' },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
    expect(result).toEqual({ wineId: 'wine-1', count: 1 });
  });

  it('decrementLike only matches docs with count > 0', async () => {
    (mockModel.findOneAndUpdate as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      makeLeanQuery({ wineId: 'wine-1', count: 0 })
    );
    const result = await wineLikeRepository.decrementLike('wine-1');
    expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
      { wineId: 'wine-1', count: { $gt: 0 } },
      { $inc: { count: -1 } },
      { new: true }
    );
    expect(result).toEqual({ wineId: 'wine-1', count: 0 });
  });

  it('decrementLike returns null when the wine has no likes yet', async () => {
    (mockModel.findOneAndUpdate as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery(null));
    const result = await wineLikeRepository.decrementLike('wine-2');
    expect(result).toBeNull();
  });

  it('getCounts returns all like docs', async () => {
    (mockModel.find as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      makeLeanQuery([{ wineId: 'wine-1', count: 3 }])
    );
    const result = await wineLikeRepository.getCounts();
    expect(result).toEqual([{ wineId: 'wine-1', count: 3 }]);
  });

  it('getAllSorted sorts by count descending', async () => {
    const sort = vi.fn().mockReturnValue(makeLeanQuery([{ wineId: 'wine-2', count: 5 }]));
    (mockModel.find as ReturnType<typeof vi.fn>).mockReturnValueOnce({ sort });
    const result = await wineLikeRepository.getAllSorted();
    expect(sort).toHaveBeenCalledWith({ count: -1 });
    expect(result).toEqual([{ wineId: 'wine-2', count: 5 }]);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/features/wine-likes/repository/wine-like.repository.spec.ts`
Expected: FAIL — `Cannot find module './wine-like.repository'`

- [ ] **Step 4: Write the repository implementation**

```ts
// src/features/wine-likes/repository/wine-like.repository.ts
import { WineLikeDocument, WineLikeModel } from '@/features/wine-likes/schema/wine-like.schema';
import { mongo } from '@/shared/lib/mongo';

export const wineLikeRepository = {
  async incrementLike(wineId: string): Promise<WineLikeDocument> {
    await mongo.connect();
    return WineLikeModel.findOneAndUpdate(
      { wineId },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    ).lean() as Promise<WineLikeDocument>;
  },

  async decrementLike(wineId: string): Promise<WineLikeDocument | null> {
    await mongo.connect();
    return WineLikeModel.findOneAndUpdate(
      { wineId, count: { $gt: 0 } },
      { $inc: { count: -1 } },
      { new: true }
    ).lean() as Promise<WineLikeDocument | null>;
  },

  async getCounts(): Promise<WineLikeDocument[]> {
    await mongo.connect();
    return WineLikeModel.find().lean() as Promise<WineLikeDocument[]>;
  },

  async getAllSorted(): Promise<WineLikeDocument[]> {
    await mongo.connect();
    return WineLikeModel.find().sort({ count: -1 }).lean() as Promise<WineLikeDocument[]>;
  },
};
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/features/wine-likes/repository/wine-like.repository.spec.ts`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add src/features/wine-likes/schema/wine-like.schema.ts src/features/wine-likes/repository/wine-like.repository.ts src/features/wine-likes/repository/wine-like.repository.spec.ts
git commit -m "feat: add wine-like schema and repository"
```

---

### Task 2: Wine-like service

**Files:**
- Create: `src/features/wine-likes/service/wine-like.service.ts`
- Test: `src/features/wine-likes/service/wine-like.service.spec.ts`

**Interfaces:**
- Consumes: `wineLikeRepository.incrementLike/decrementLike/getCounts/getAllSorted` (Task 1)
- Produces: `toggleWineLikeService(wineId: string, liked: boolean): Promise<ServiceResult<{ count: number }>>`, `getWineLikeCountsService(): Promise<ServiceResult<Record<string, number>>>`, `getAllLikedWinesSortedService(): Promise<ServiceResult<{ wineId: string; count: number }[]>>`

- [ ] **Step 1: Write the failing test**

```ts
// src/features/wine-likes/service/wine-like.service.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/wine-likes/repository/wine-like.repository', () => ({
  wineLikeRepository: {
    incrementLike: vi.fn(),
    decrementLike: vi.fn(),
    getCounts: vi.fn(),
    getAllSorted: vi.fn(),
  },
}));

import { wineLikeRepository } from '@/features/wine-likes/repository/wine-like.repository';

import {
  toggleWineLikeService,
  getWineLikeCountsService,
  getAllLikedWinesSortedService,
} from './wine-like.service';

describe('toggleWineLikeService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('increments when liked is true and returns the new count', async () => {
    vi.mocked(wineLikeRepository.incrementLike).mockResolvedValueOnce({ wineId: 'wine-1', count: 4 } as never);
    const result = await toggleWineLikeService('wine-1', true);
    expect(wineLikeRepository.incrementLike).toHaveBeenCalledWith('wine-1');
    expect(result).toEqual({ data: { count: 4 }, status: 200 });
  });

  it('decrements when liked is false and returns the new count', async () => {
    vi.mocked(wineLikeRepository.decrementLike).mockResolvedValueOnce({ wineId: 'wine-1', count: 2 } as never);
    const result = await toggleWineLikeService('wine-1', false);
    expect(wineLikeRepository.decrementLike).toHaveBeenCalledWith('wine-1');
    expect(result).toEqual({ data: { count: 2 }, status: 200 });
  });

  it('returns 0 when decrementing a wine already at 0', async () => {
    vi.mocked(wineLikeRepository.decrementLike).mockResolvedValueOnce(null);
    const result = await toggleWineLikeService('wine-1', false);
    expect(result).toEqual({ data: { count: 0 }, status: 200 });
  });
});

describe('getWineLikeCountsService', () => {
  it('reduces the doc list into a wineId -> count map', async () => {
    vi.mocked(wineLikeRepository.getCounts).mockResolvedValueOnce([
      { wineId: 'wine-1', count: 3 },
      { wineId: 'wine-2', count: 0 },
    ] as never);
    const result = await getWineLikeCountsService();
    expect(result).toEqual({ data: { 'wine-1': 3, 'wine-2': 0 }, status: 200 });
  });
});

describe('getAllLikedWinesSortedService', () => {
  it('maps docs to plain wineId/count pairs, already sorted by the repo', async () => {
    vi.mocked(wineLikeRepository.getAllSorted).mockResolvedValueOnce([
      { wineId: 'wine-2', count: 5 },
      { wineId: 'wine-1', count: 1 },
    ] as never);
    const result = await getAllLikedWinesSortedService();
    expect(result).toEqual({
      data: [{ wineId: 'wine-2', count: 5 }, { wineId: 'wine-1', count: 1 }],
      status: 200,
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/features/wine-likes/service/wine-like.service.spec.ts`
Expected: FAIL — `Cannot find module './wine-like.service'`

- [ ] **Step 3: Write the service implementation**

```ts
// src/features/wine-likes/service/wine-like.service.ts
import { wineLikeRepository } from '@/features/wine-likes/repository/wine-like.repository';
import { ServiceResult } from '@/shared/types/common';

export async function toggleWineLikeService(
  wineId: string,
  liked: boolean
): Promise<ServiceResult<{ count: number }>> {
  const doc = liked
    ? await wineLikeRepository.incrementLike(wineId)
    : await wineLikeRepository.decrementLike(wineId);
  return { data: { count: doc?.count ?? 0 }, status: 200 };
}

export async function getWineLikeCountsService(): Promise<ServiceResult<Record<string, number>>> {
  const docs = await wineLikeRepository.getCounts();
  const counts = docs.reduce<Record<string, number>>((acc, doc) => {
    acc[doc.wineId] = doc.count;
    return acc;
  }, {});
  return { data: counts, status: 200 };
}

export async function getAllLikedWinesSortedService(): Promise<
  ServiceResult<{ wineId: string; count: number }[]>
> {
  const docs = await wineLikeRepository.getAllSorted();
  return { data: docs.map((doc) => ({ wineId: doc.wineId, count: doc.count })), status: 200 };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/features/wine-likes/service/wine-like.service.spec.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/wine-likes/service/wine-like.service.ts src/features/wine-likes/service/wine-like.service.spec.ts
git commit -m "feat: add wine-like service"
```

---

### Task 3: Validation + API routes

**Files:**
- Create: `src/features/wine-likes/validations/wine-like.validation.ts`
- Create: `src/app/api/wines/[wineId]/like/route.ts`
- Test: `src/app/api/wines/[wineId]/like/route.spec.ts`
- Create: `src/app/api/wines/likes/route.ts`
- Test: `src/app/api/wines/likes/route.spec.ts`

**Interfaces:**
- Consumes: `toggleWineLikeService`, `getWineLikeCountsService` (Task 2), `validateBody` (`@/shared/middleware/validate-body`)
- Produces: `POST /api/wines/[wineId]/like` body `{ liked: boolean }` → `{ count: number }`; `GET /api/wines/likes` → `{ counts: Record<string, number> }`

- [ ] **Step 1: Write the validation schema**

```ts
// src/features/wine-likes/validations/wine-like.validation.ts
import { z } from 'zod';

export const ToggleLikeSchema = z.object({ liked: z.boolean() });
export type ToggleLikeType = z.infer<typeof ToggleLikeSchema>;
```

- [ ] **Step 2: Write the failing test for the toggle route**

```ts
// src/app/api/wines/[wineId]/like/route.spec.ts
import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/wine-likes/service/wine-like.service', () => ({
  toggleWineLikeService: vi.fn(),
}));
vi.mock('@/shared/middleware/validate-body', () => ({
  validateBody: vi.fn(),
}));

import { toggleWineLikeService } from '@/features/wine-likes/service/wine-like.service';
import { validateBody } from '@/shared/middleware/validate-body';

import { POST } from './route';

const mockToggle = vi.mocked(toggleWineLikeService);
const mockValidate = vi.mocked(validateBody);

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/wines/wine-1/like', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/wines/[wineId]/like', () => {
  beforeEach(() => vi.clearAllMocks());

  it('toggles the like and returns the new count', async () => {
    mockValidate.mockResolvedValueOnce({ data: { liked: true } } as never);
    mockToggle.mockResolvedValueOnce({ data: { count: 1 }, status: 200 });
    const res = await POST(makeRequest({ liked: true }), { params: Promise.resolve({ wineId: 'wine-1' }) });
    expect(mockToggle).toHaveBeenCalledWith('wine-1', true);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ count: 1 });
  });

  it('returns validation error when body is invalid', async () => {
    mockValidate.mockResolvedValueOnce(NextResponse.json({ error: 'VALIDATION_ERROR' }, { status: 400 }));
    const res = await POST(makeRequest({}), { params: Promise.resolve({ wineId: 'wine-1' }) });
    expect(res.status).toBe(400);
  });

  it('returns 500 when the service throws', async () => {
    mockValidate.mockResolvedValueOnce({ data: { liked: true } } as never);
    mockToggle.mockRejectedValueOnce(new Error('DB error'));
    const res = await POST(makeRequest({ liked: true }), { params: Promise.resolve({ wineId: 'wine-1' }) });
    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/app/api/wines/[wineId]/like/route.spec.ts`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 4: Write the toggle route**

```ts
// src/app/api/wines/[wineId]/like/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { toggleWineLikeService } from '@/features/wine-likes/service/wine-like.service';
import { ToggleLikeSchema } from '@/features/wine-likes/validations/wine-like.validation';
import { validateBody } from '@/shared/middleware/validate-body';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ wineId: string }> }
) {
  try {
    const validated = await validateBody(req, ToggleLikeSchema);
    if (validated instanceof NextResponse) return validated;

    const { wineId } = await params;
    const result = await toggleWineLikeService(wineId, validated.data.liked);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/app/api/wines/[wineId]/like/route.spec.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Write the failing test for the counts route**

```ts
// src/app/api/wines/likes/route.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/wine-likes/service/wine-like.service', () => ({
  getWineLikeCountsService: vi.fn(),
}));

import { getWineLikeCountsService } from '@/features/wine-likes/service/wine-like.service';

import { GET } from './route';

const mockGetCounts = vi.mocked(getWineLikeCountsService);

describe('GET /api/wines/likes', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the counts map', async () => {
    mockGetCounts.mockResolvedValueOnce({ data: { 'wine-1': 3 }, status: 200 });
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ counts: { 'wine-1': 3 } });
  });

  it('returns 500 when the service throws', async () => {
    mockGetCounts.mockRejectedValueOnce(new Error('DB error'));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 7: Run the test to verify it fails**

Run: `npx vitest run src/app/api/wines/likes/route.spec.ts`
Expected: FAIL — `Cannot find module './route'`

- [ ] **Step 8: Write the counts route**

```ts
// src/app/api/wines/likes/route.ts
import { NextResponse } from 'next/server';

import { getWineLikeCountsService } from '@/features/wine-likes/service/wine-like.service';

export async function GET() {
  try {
    const result = await getWineLikeCountsService();
    return NextResponse.json({ counts: result.data }, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
```

- [ ] **Step 9: Run the test to verify it passes**

Run: `npx vitest run src/app/api/wines/likes/route.spec.ts`
Expected: PASS (2 tests)

- [ ] **Step 10: Commit**

```bash
git add src/features/wine-likes/validations/wine-like.validation.ts "src/app/api/wines/[wineId]/like/route.ts" "src/app/api/wines/[wineId]/like/route.spec.ts" src/app/api/wines/likes/route.ts src/app/api/wines/likes/route.spec.ts
git commit -m "feat: add wine like toggle and counts API routes"
```

---

### Task 4: Zustand store for client-side like state

**Files:**
- Create: `src/features/wine-likes/store/wine-likes-store.ts`
- Test: `src/features/wine-likes/store/wine-likes-store.spec.ts`

**Interfaces:**
- Produces: `useWineLikesStore` — plain Zustand `create()` hook (same shape as `useContentStore`/`useLanguageStore`, NOT the context+vanilla-store pattern) with state `{ counts: Record<string, number>; likedWineIds: string[] }` and actions `setCounts(counts)`, `setLikedWineIds(ids)`, `toggle(wineId)`

This deliberately does not follow CLAUDE.md §10's context+provider pattern. `TsabolaWineCard`/`TsabolaWineCatalog` are rendered today (in tests and in the app) without any `StoreProvider` wrapper — they read `useContentStore`/`useLanguageStore` as plain global hooks. A context-based store would throw `must be used within StoreProvider` the moment `WineLikeButton` mounts inside them. Matching the pattern actually used by the tree this feature mounts into takes priority over the general rule here.

- [ ] **Step 1: Write the failing test**

```ts
// src/features/wine-likes/store/wine-likes-store.spec.ts
import { beforeEach, describe, expect, it } from 'vitest';

import { useWineLikesStore } from './wine-likes-store';

beforeEach(() => {
  useWineLikesStore.setState({ counts: {}, likedWineIds: [] });
});

describe('useWineLikesStore', () => {
  it('setCounts replaces the counts map', () => {
    useWineLikesStore.getState().setCounts({ 'wine-1': 2 });
    expect(useWineLikesStore.getState().counts).toEqual({ 'wine-1': 2 });
  });

  it('toggle adds the wineId and increments its count when not liked', () => {
    useWineLikesStore.setState({ counts: { 'wine-1': 2 }, likedWineIds: [] });
    useWineLikesStore.getState().toggle('wine-1');
    const state = useWineLikesStore.getState();
    expect(state.likedWineIds).toEqual(['wine-1']);
    expect(state.counts['wine-1']).toBe(3);
  });

  it('toggle removes the wineId and decrements its count when already liked', () => {
    useWineLikesStore.setState({ counts: { 'wine-1': 2 }, likedWineIds: ['wine-1'] });
    useWineLikesStore.getState().toggle('wine-1');
    const state = useWineLikesStore.getState();
    expect(state.likedWineIds).toEqual([]);
    expect(state.counts['wine-1']).toBe(1);
  });

  it('toggle never takes a count below 0', () => {
    useWineLikesStore.setState({ counts: { 'wine-1': 0 }, likedWineIds: ['wine-1'] });
    useWineLikesStore.getState().toggle('wine-1');
    expect(useWineLikesStore.getState().counts['wine-1']).toBe(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/features/wine-likes/store/wine-likes-store.spec.ts`
Expected: FAIL — `Cannot find module './wine-likes-store'`

- [ ] **Step 3: Write the store implementation**

```ts
// src/features/wine-likes/store/wine-likes-store.ts
import { create } from 'zustand'

type WineLikesStore = {
  counts: Record<string, number>
  likedWineIds: string[]
  setCounts: (counts: Record<string, number>) => void
  setLikedWineIds: (ids: string[]) => void
  toggle: (wineId: string) => void
}

export const useWineLikesStore = create<WineLikesStore>()((set, get) => ({
  counts: {},
  likedWineIds: [],
  setCounts: (counts) => set({ counts }),
  setLikedWineIds: (likedWineIds) => set({ likedWineIds }),
  toggle: (wineId) => {
    const { counts, likedWineIds } = get()
    const isLiked = likedWineIds.includes(wineId)
    const nextLiked = isLiked
      ? likedWineIds.filter((id) => id !== wineId)
      : [...likedWineIds, wineId]
    const current = counts[wineId] ?? 0
    const nextCount = isLiked ? Math.max(0, current - 1) : current + 1
    set({ likedWineIds: nextLiked, counts: { ...counts, [wineId]: nextCount } })
  },
}))
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/features/wine-likes/store/wine-likes-store.spec.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/wine-likes/store/wine-likes-store.ts src/features/wine-likes/store/wine-likes-store.spec.ts
git commit -m "feat: add wine-likes client store"
```

---

### Task 5: WineLikeButton + hooks, wired into card/lightbox/catalog

**Files:**
- Create: `src/features/wine-likes/hooks/use-wine-likes.ts`
- Create: `src/features/wine-likes/components/wine-like-button.tsx`
- Modify: `src/features/tsabola/components/tsabola-wine-card.tsx`
- Modify: `src/features/tsabola/components/tsabola-wine-lightbox.tsx`
- Modify: `src/features/tsabola/components/tsabola-wine-catalog.tsx`

**Interfaces:**
- Consumes: `useWineLikesStore` (Task 4), `http` (`@/shared/lib/http`)
- Produces: `useHydrateWineLikes(): void` (call once per page), `useToggleWineLike(): (wineId: string) => void`, `<WineLikeButton wineId={string} className?={string} />`

No new automated test for this task (matches this repo's convention — `use-login.ts`, `use-wine-discount.ts`, and every existing `.tsx` component under `tsabola/components/` have no dedicated test either). The testable deliverable is: the existing `tsabola-wine-catalog.test.tsx` suite still passes unmodified, proving the new button doesn't break lightbox open/close or catalog rendering.

- [ ] **Step 1: Write the hooks**

```ts
// src/features/wine-likes/hooks/use-wine-likes.ts
'use client'

import { useEffect } from 'react'

import { useWineLikesStore } from '@/features/wine-likes/store/wine-likes-store'
import { http } from '@/shared/lib/http'

const STORAGE_KEY = 'tsabola-liked-wines'

function readLikedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeLikedIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // storage unavailable (private mode, quota) - not worth failing the click over
  }
}

export function useHydrateWineLikes() {
  const setCounts = useWineLikesStore((state) => state.setCounts)
  const setLikedWineIds = useWineLikesStore((state) => state.setLikedWineIds)

  useEffect(() => {
    setLikedWineIds(readLikedIds())
    http
      .get<{ counts: Record<string, number> }>('/wines/likes')
      .then(({ counts }) => setCounts(counts))
      .catch(() => {})
  }, [setCounts, setLikedWineIds])
}

export function useToggleWineLike() {
  const likedWineIds = useWineLikesStore((state) => state.likedWineIds)
  const toggle = useWineLikesStore((state) => state.toggle)

  return (wineId: string) => {
    const wasLiked = likedWineIds.includes(wineId)
    toggle(wineId)
    writeLikedIds(wasLiked ? likedWineIds.filter((id) => id !== wineId) : [...likedWineIds, wineId])
    http.post(`/wines/${wineId}/like`, { liked: !wasLiked }).catch(() => {})
  }
}
```

- [ ] **Step 2: Write the button component**

```tsx
// src/features/wine-likes/components/wine-like-button.tsx
'use client'

import { Heart } from 'lucide-react'

import { useToggleWineLike } from '@/features/wine-likes/hooks/use-wine-likes'
import { useWineLikesStore } from '@/features/wine-likes/store/wine-likes-store'

type Props = {
  wineId: string
  className?: string
}

export function WineLikeButton({ wineId, className = '' }: Props) {
  const count = useWineLikesStore((state) => state.counts[wineId] ?? 0)
  const liked = useWineLikesStore((state) => state.likedWineIds.includes(wineId))
  const toggleLike = useToggleWineLike()

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        toggleLike(wineId)
      }}
      aria-label={liked ? 'გულის მოხსნა' : 'დალაიქება'}
      aria-pressed={liked}
      className={`flex items-center gap-1 rounded-full bg-cream/90 dark:bg-charcoal/90 px-2 py-1 text-xs font-semibold text-wine shadow transition-colors hover:bg-cream dark:hover:bg-charcoal ${className}`}
    >
      <Heart className={`size-4 ${liked ? 'fill-wine text-wine' : 'text-wine'}`} />
      <span>{count}</span>
    </button>
  )
}
```

- [ ] **Step 3: Wire the hydration hook into the catalog**

Modify `src/features/tsabola/components/tsabola-wine-catalog.tsx` — add the import and call it once at the top of the component body:

```tsx
import { useHydrateWineLikes } from '@/features/wine-likes/hooks/use-wine-likes'
```

```tsx
export function TsabolaWineCatalog() {
  const { t, lang, r } = useLang()
  useHydrateWineLikes()
  const eyebrowStyle = useTextStyle('wines', 'eyebrow')
  // ...rest unchanged
```

- [ ] **Step 4: Mount the button on the wine card**

Modify `src/features/tsabola/components/tsabola-wine-card.tsx`. The image and its click-to-open button currently carry the sizing classes directly; wrap them in a `relative` container so the like button can sit on top without nesting inside the clickable `<button>` (a `<button>` inside a `<button>` is invalid HTML and breaks click handling):

Replace:
```tsx
      {/* Image */}
      {item.image ? (
        <button
          type="button"
          onClick={() => onOpen(item)}
          aria-label={r(item.name, lang)}
          className={
            'w-full h-80 sm:h-auto sm:w-2/5 sm:order-2 sm:self-stretch bg-cream/20 block ' +
            'overflow-hidden cursor-pointer focus:outline-none ' +
            'focus-visible:ring-2 focus-visible:ring-wine/50'
          }
        >
          <div className="h-full w-full group-hover:animate-wine-float">
            <img
              src={item.image}
              alt={r(item.name, lang)}
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${IMAGE_SIZE_SCALE_CLASS[item.imageSize]}`}
              // Continuous focal point (0-100%) has no static Tailwind utility — inline style is the only way to express it.
              style={{ objectPosition: `${item.position.x}% ${item.position.y}%` }}
            />
          </div>
        </button>
      ) : (
        <div
          data-placeholder="true"
          className="w-full h-80 sm:h-auto sm:w-2/5 sm:order-2 sm:self-stretch bg-gradient-to-br from-wine/10 via-cream to-charcoal/10"
        />
      )}
```

With:
```tsx
      {/* Image */}
      <div className="relative w-full h-80 sm:h-auto sm:w-2/5 sm:order-2 sm:self-stretch">
        {item.image ? (
          <button
            type="button"
            onClick={() => onOpen(item)}
            aria-label={r(item.name, lang)}
            className={
              'w-full h-full bg-cream/20 block ' +
              'overflow-hidden cursor-pointer focus:outline-none ' +
              'focus-visible:ring-2 focus-visible:ring-wine/50'
            }
          >
            <div className="h-full w-full group-hover:animate-wine-float">
              <img
                src={item.image}
                alt={r(item.name, lang)}
                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${IMAGE_SIZE_SCALE_CLASS[item.imageSize]}`}
                // Continuous focal point (0-100%) has no static Tailwind utility — inline style is the only way to express it.
                style={{ objectPosition: `${item.position.x}% ${item.position.y}%` }}
              />
            </div>
          </button>
        ) : (
          <div
            data-placeholder="true"
            className="w-full h-full bg-gradient-to-br from-wine/10 via-cream to-charcoal/10"
          />
        )}
        <WineLikeButton wineId={item.id} className="absolute top-3 right-3 z-10" />
      </div>
```

Add the import at the top of the file:
```tsx
import { WineLikeButton } from '@/features/wine-likes/components/wine-like-button'
```

- [ ] **Step 5: Mount the button in the lightbox**

Modify `src/features/tsabola/components/tsabola-wine-lightbox.tsx`. Replace the standalone badge line:

```tsx
            <span
              style={badgeStyle.style} suppressHydrationWarning
              className={`inline-block self-start px-3 py-1 font-semibold tracking-widest uppercase border border-wine/40 text-wine ${badgeStyle.className}`}
            >
              {r(wine.typeBadge, lang)}
            </span>
```

With:
```tsx
            <div className="flex items-center justify-between gap-3">
              <span
                style={badgeStyle.style} suppressHydrationWarning
                className={`inline-block self-start px-3 py-1 font-semibold tracking-widest uppercase border border-wine/40 text-wine ${badgeStyle.className}`}
              >
                {r(wine.typeBadge, lang)}
              </span>
              <WineLikeButton wineId={wine.id} />
            </div>
```

Add the import:
```tsx
import { WineLikeButton } from '@/features/wine-likes/components/wine-like-button'
```

- [ ] **Step 6: Run the existing catalog test suite to confirm nothing broke**

Run: `npx vitest run src/features/tsabola/components/__tests__/tsabola-wine-catalog.test.tsx`
Expected: PASS (5 tests) — the heart button's aria-label (`დალაიქება`/`გულის მოხსნა`) never matches the wine-name regexes the existing tests query by, so `getAllByRole('button', { name: /ცაბო ჩინებული/i })` still resolves to exactly the image-open button.

- [ ] **Step 7: Run the full test suite**

Run: `npm run test:run`
Expected: all suites pass (no regressions elsewhere)

- [ ] **Step 8: Commit**

```bash
git add src/features/wine-likes/hooks/use-wine-likes.ts src/features/wine-likes/components/wine-like-button.tsx src/features/tsabola/components/tsabola-wine-card.tsx src/features/tsabola/components/tsabola-wine-lightbox.tsx src/features/tsabola/components/tsabola-wine-catalog.tsx
git commit -m "feat: add heart-to-like button on wine card and lightbox"
```

---

### Task 6: Fix wine id stability in the editor

**Files:**
- Modify: `src/features/tsabola/admin/editors/wines-editor.tsx:47-51`

**Interfaces:**
- No new interfaces — internal fix only.

- [ ] **Step 1: Replace the collision-prone id generator**

Current code (`wines-editor.tsx:47-51`):
```tsx
  const addWine = () => {
    const newWine: WineItem = { ...EMPTY_WINE, id: `wine-${content.wines.items.length + 1}` }
    setWines([...content.wines.items, newWine])
    setExpandedId(newWine.id)
  }
```

Replace with:
```tsx
  const addWine = () => {
    const newWine: WineItem = { ...EMPTY_WINE, id: crypto.randomUUID() }
    setWines([...content.wines.items, newWine])
    setExpandedId(newWine.id)
  }
```

- [ ] **Step 2: Run lint to confirm no type errors**

Run: `npx eslint src/features/tsabola/admin/editors/wines-editor.tsx`
Expected: no errors (existing warnings, if any, unrelated)

- [ ] **Step 3: Commit**

```bash
git add src/features/tsabola/admin/editors/wines-editor.tsx
git commit -m "fix: generate stable wine ids to avoid collisions with wine-like counts"
```

---

### Task 7: Admin dashboard — join all wines with their like counts

**Files:**
- Modify: `src/features/tsabola/service/admin-dashboard.service.ts`
- Modify: `src/features/tsabola/service/admin-dashboard.service.spec.ts`

**Interfaces:**
- Consumes: `getAllLikedWinesSortedService` (Task 2)
- Produces: `AdminDashboardStats.topLikedWines: { wineId: string; name: string; count: number }[]` — **every** wine in `content.wines.items`, joined with its count (0 if it has none), sorted desc. No limit.

- [ ] **Step 1: Write the failing test**

Add to `admin-dashboard.service.spec.ts` (alongside the existing mocks/imports):

```ts
vi.mock('@/features/wine-likes/service/wine-like.service', () => ({
  getAllLikedWinesSortedService: vi.fn(),
}));
```

```ts
import { getAllLikedWinesSortedService } from '@/features/wine-likes/service/wine-like.service';
```

Add a `wines.items` with names to `baseContent` (the existing fixture only has `id`s — extend it) and a new test:

```ts
const baseContent = {
  wines: {
    items: [
      { id: 'wine-1', name: { ka: 'ჩინებული', en: 'Chinebuli' } },
      { id: 'wine-2', name: { ka: 'დანახარული', en: 'Danakharuli' } },
    ],
  },
  news: { items: [{ id: 'a', published: true }, { id: 'b', published: false }] },
};
```

```ts
it('joins every wine with its like count, defaulting to 0, sorted desc', async () => {
  vi.mocked(getSiteContent).mockResolvedValueOnce({
    data: { content: baseContent, theme: {}, visibility: {}, updatedAt: null },
    status: 200,
  } as never);
  vi.mocked(listGalleryImages).mockResolvedValueOnce({ data: [], status: 200 } as never);
  vi.mocked(getUserCountsService).mockResolvedValueOnce({ data: { total: 0, admins: 0 }, status: 200 } as never);
  vi.mocked(getAllLikedWinesSortedService).mockResolvedValueOnce({
    data: [{ wineId: 'wine-2', count: 5 }],
    status: 200,
  });

  const result = await getAdminDashboardStats();

  expect(result.data).toMatchObject({
    topLikedWines: [
      { wineId: 'wine-2', name: 'დანახარული', count: 5 },
      { wineId: 'wine-1', name: 'ჩინებული', count: 0 },
    ],
  });
});
```

The two pre-existing tests in this file (`'aggregates real counts...'` and `'defaults to zeroed stats...'`) now also hit `getAllLikedWinesSortedService` inside the same `Promise.all` — without a queued mock value, the auto-mocked function returns `undefined`, and `likedWinesResult.data` throws. Add this line to **both** existing tests, right alongside their other `mockResolvedValueOnce` calls:

```ts
vi.mocked(getAllLikedWinesSortedService).mockResolvedValueOnce({ data: [], status: 200 });
```

Also change their `expect(result.data).toEqual({...})` to `expect(result.data).toMatchObject({...})` (they currently assert the whole object with `toEqual` — adding the `topLikedWines` field breaks that exact-equality check).

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/features/tsabola/service/admin-dashboard.service.spec.ts`
Expected: FAIL — `topLikedWines` missing from the result

- [ ] **Step 3: Implement the join**

Modify `src/features/tsabola/service/admin-dashboard.service.ts`:

```ts
import { getAllLikedWinesSortedService } from '@/features/wine-likes/service/wine-like.service';
import { getUserCountsService } from '@/features/auth/service/auth.service';
import { listGalleryImages } from '@/features/gallery/service/gallery.service';
import { getSiteContent } from '@/features/tsabola/service/site-content.service';
import type { SiteContent } from '@/features/tsabola/types';
import { ServiceResult } from '@/shared/types/common';

export type AdminDashboardStats = {
  wines: number;
  news: { total: number; published: number };
  gallery: { total: number; published: number };
  users: { total: number; admins: number };
  contentUpdatedAt: string | null;
  topLikedWines: { wineId: string; name: string; count: number }[];
};

export async function getAdminDashboardStats(): Promise<ServiceResult<AdminDashboardStats>> {
  const [siteContentResult, galleryResult, usersResult, likedWinesResult] = await Promise.all([
    getSiteContent(),
    listGalleryImages(),
    getUserCountsService(),
    getAllLikedWinesSortedService(),
  ]);

  const siteContentData = siteContentResult.data;
  const content: SiteContent | null = 'error' in siteContentData ? null : (siteContentData.content as SiteContent);
  const contentUpdatedAt = 'error' in siteContentData ? null : siteContentData.updatedAt;

  const galleryImages = 'error' in galleryResult.data ? [] : galleryResult.data;
  const users = 'error' in usersResult.data ? { total: 0, admins: 0 } : usersResult.data;
  const likeCounts = 'error' in likedWinesResult.data ? [] : likedWinesResult.data;
  const countByWineId = new Map(likeCounts.map((entry) => [entry.wineId, entry.count]));

  const topLikedWines = (content?.wines.items ?? [])
    .map((wine) => ({
      wineId: wine.id,
      name: wine.name.ka || wine.name.en,
      count: countByWineId.get(wine.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    data: {
      wines: content?.wines.items.length ?? 0,
      news: {
        total: content?.news.items.length ?? 0,
        published: content?.news.items.filter((item) => item.published).length ?? 0,
      },
      gallery: {
        total: galleryImages.length,
        published: galleryImages.filter((image) => image.published).length,
      },
      users,
      contentUpdatedAt,
      topLikedWines,
    },
    status: 200,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/features/tsabola/service/admin-dashboard.service.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/tsabola/service/admin-dashboard.service.ts src/features/tsabola/service/admin-dashboard.service.spec.ts
git commit -m "feat: join like counts into admin dashboard stats"
```

---

### Task 8: Dashboard bar chart UI

**Files:**
- Create: `src/features/tsabola/admin/editors/_top-liked-chart.tsx`
- Modify: `src/features/tsabola/admin/editors/dashboard-editor.tsx`

**Interfaces:**
- Consumes: `AdminDashboardStats.topLikedWines` (Task 7), shape `{ wineId: string; name: string; count: number }[]`
- Produces: `<TopLikedChart wines={...} />`

- [ ] **Step 1: Write the chart component**

```tsx
// src/features/tsabola/admin/editors/_top-liked-chart.tsx
'use client'

type Wine = { wineId: string; name: string; count: number }

type Props = {
  wines: Wine[]
}

export function TopLikedChart({ wines }: Props) {
  if (wines.length === 0) return null
  const maxCount = Math.max(1, ...wines.map((w) => w.count))

  return (
    <div>
      <p className="text-xs font-medium text-charcoal/50 uppercase tracking-wide mb-3">
        ყველაზე მოწონებული პროდუქტები
      </p>
      <div className="max-h-96 overflow-y-auto flex flex-col gap-2 pr-1">
        {wines.map((wine) => (
          <div key={wine.wineId} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-sm text-charcoal/70">{wine.name}</span>
            <div className="flex-1 h-4 bg-cream/60 rounded overflow-hidden">
              <div
                className="h-full bg-wine rounded"
                style={{ width: `${(wine.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-sm font-bold text-wine">{wine.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

`style={{ width: ... }}` here is a continuous data-driven percentage — the same category of exception `tsabola-wine-card.tsx` already uses for `objectPosition` (CLAUDE.md §0 bans inline styles for *visual* styling; there's no static Tailwind class for an arbitrary runtime percentage).

- [ ] **Step 2: Wire it into the dashboard editor**

Modify `src/features/tsabola/admin/editors/dashboard-editor.tsx`. Add the import:

```tsx
import { TopLikedChart } from './_top-liked-chart'
```

Extend the local `DashboardStats` type:

```tsx
type DashboardStats = {
  wines: number
  news: { total: number; published: number }
  gallery: { total: number; published: number }
  users: { total: number; admins: number }
  contentUpdatedAt: string | null
  topLikedWines: { wineId: string; name: string; count: number }[]
}
```

Render the chart below the stat tiles grid, still inside the `{stats && (...)}` block, before the "ბოლო შენახვა" line:

```tsx
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {tiles.map((tile) => (
              <div key={tile.label} className="border border-border-wine rounded p-3 bg-cream/40 sm:p-4">
                <p className="text-xs font-medium text-charcoal/50 uppercase tracking-wide">{tile.label}</p>
                <p className="text-xl font-bold text-wine mt-1 whitespace-nowrap sm:text-2xl">{tile.value}</p>
                {tile.hint && <p className="text-xs text-charcoal/40 mt-1">{tile.hint}</p>}
              </div>
            ))}
          </div>

          <TopLikedChart wines={stats.topLikedWines} />

          <p className="text-xs text-charcoal/40 pt-4 border-t border-border-wine">
            ბოლო შენახვა: {updatedLabel}
          </p>
```

- [ ] **Step 3: Lint the two changed files**

Run: `npx eslint src/features/tsabola/admin/editors/_top-liked-chart.tsx src/features/tsabola/admin/editors/dashboard-editor.tsx`
Expected: no errors

- [ ] **Step 4: Run the full test suite**

Run: `npm run test:run`
Expected: all suites pass

- [ ] **Step 5: Commit**

```bash
git add src/features/tsabola/admin/editors/_top-liked-chart.tsx src/features/tsabola/admin/editors/dashboard-editor.tsx
git commit -m "feat: show top-liked products as a bar chart on the admin dashboard"
```

---

## Manual verification (after all tasks)

1. `npm run dev`, open `/` — heart a wine on the catalog card, confirm the count increments and the heart fills; reload the page, confirm the liked state and count persist (localStorage + server count).
2. Open the wine's lightbox — confirm the same heart/count shows there and stays in sync with the card.
3. Sign in as admin, open `/admin` dashboard — confirm the bar chart lists every wine (including ones with 0 likes), sorted by count, with the liked wine's bar visibly filled.
4. Add a third wine in the wines editor, confirm it appears in the dashboard chart at 0 with no code changes needed (proves "no hard cap" holds).
