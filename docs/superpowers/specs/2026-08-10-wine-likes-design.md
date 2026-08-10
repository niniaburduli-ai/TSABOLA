# Wine Likes (Heart) Feature — Design

## Goal

Visitors can "heart" a wine on the public site. No accounts, no per-visitor
identity tracking — the site has no registration, and who liked what is not
interesting. Only the aggregate count matters. The count shows next to the
heart on the public wine card/lightbox, and admins see a ranked bar chart of
all products by like count on the dashboard.

## Non-goals

- No per-user/per-voter identity or dedupe (explicitly rejected — adds
  complexity for no value since there's no login).
- No hard cap on how many products appear in the dashboard chart — it must
  keep showing every product as more are added over time, not a fixed top-N.

## Data model

New feature: `src/features/wine-likes/`

```ts
// schema/wine-like.schema.ts
const WineLikeSchema = new Schema({
  wineId: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export type WineLikeDocument = InferSchemaType<typeof WineLikeSchema> & { _id: mongoose.Types.ObjectId };
export const WineLikeModel = mongoose.models.WineLike || mongoose.model('WineLike', WineLikeSchema);
```

One document per wine, holding a running counter. `wineId` matches
`WineItem.id` from `content.wines.items` (site-content, not its own
collection).

## Repository — `repository/wine-like.repository.ts`

Raw queries only, no conditionals beyond query filters:

- `incrementLike(wineId): Promise<WineLikeDocument>` —
  `findOneAndUpdate({ wineId }, { $inc: { count: 1 } }, { upsert: true, new: true })`
- `decrementLike(wineId): Promise<WineLikeDocument | null>` —
  `findOneAndUpdate({ wineId, count: { $gt: 0 } }, { $inc: { count: -1 } }, { new: true })`
  (filter `count: { $gt: 0 }` prevents negative counts; no-op if already 0)
- `getCounts(): Promise<{ wineId: string; count: number }[]>` — `find().lean()`
- `getAllSorted(): Promise<{ wineId: string; count: number }[]>` — `find().sort({ count: -1 }).lean()`

## Service — `service/wine-like.service.ts`

Always returns `ServiceResult<T>`:

- `toggleWineLikeService(wineId: string, liked: boolean): Promise<ServiceResult<{ count: number }>>`
  — `liked=true` → `incrementLike`, `liked=false` → `decrementLike`. Returns
  the new count (0 if `decrementLike` returned null, i.e. was already 0).
- `getWineLikeCountsService(): Promise<ServiceResult<{ wineId: string; count: number }[]>>`
  — wraps `getCounts()`.
- `getAllLikedWinesSortedService(): Promise<ServiceResult<{ wineId: string; count: number }[]>>`
  — wraps `getAllSorted()`. No limit param — callers get everything and decide
  display, so the dashboard chart is never capped.

## Validation — `validations/wine-like.validation.ts`

```ts
export const ToggleLikeSchema = z.object({ liked: z.boolean() });
export type ToggleLikeType = z.infer<typeof ToggleLikeSchema>;
```

## API routes

- `POST /api/wines/[wineId]/like`
  - `validateBody(req, ToggleLikeSchema)`
  - calls `toggleWineLikeService(params.wineId, liked)`
  - returns `{ count }`, 200; 500 on error (standard try/catch per §6)
- `GET /api/wines/likes`
  - calls `getWineLikeCountsService()`
  - returns `{ counts: Record<wineId, number> }` (converted from array to map
    in the route, since the client wants O(1) lookup per wine card)

No cookie, no voter identity anywhere in the request path.

## Client state — who-liked-what lives only in the browser

Three-file Zustand pattern (§10), feature `wine-likes`:

1. `store/wine-likes-store.ts` — vanilla store:
   ```ts
   type WineLikesState = {
     counts: Record<string, number>;
     likedWineIds: string[];
     setCounts: (counts: Record<string, number>) => void;
     toggle: (wineId: string) => void; // optimistic count math + likedWineIds update
   };
   ```
2. `hooks/useWineLikesStore.ts` — context + `useStore` hook (matches
   `useAuthStore.ts` pattern).
3. registered in `shared/providers/store-provider.tsx` alongside the auth
   store context.

Action hook `hooks/use-wine-likes.ts`:
- on mount: read `localStorage['tsabola-liked-wines']` (JSON array of
  wineIds) → seed `likedWineIds`; fetch `GET /api/wines/likes` → seed
  `counts`.
- `toggleLike(wineId)`: flips membership in `likedWineIds`, writes the
  updated array back to `localStorage`, optimistically adjusts `counts`
  (+1/-1), fires `POST /api/wines/[wineId]/like` with the new `liked` state.
  No rollback on failure — worst case the count is off by one until next
  page load re-syncs from the server; not worth the complexity for a
  non-critical vanity counter.

## UI

- `features/wine-likes/components/wine-like-button.tsx` — `Heart` icon
  (lucide-react), filled + `text-wine` when liked, outline otherwise, count
  beside it. `onClick` calls `stopPropagation()` (sits inside the card's
  clickable image button) then `toggleLike(wineId)`.
- Mounted as a top-right overlay on `TsabolaWineCard`'s image, and inside
  `TsabolaWineLightbox`.
- `TsabolaWineCatalog` calls `use-wine-likes`'s mount-time hydration once for
  the whole grid (not per-card), so counts/likes are fetched a single time.

## Admin dashboard

- `AdminDashboardStats` (in `admin-dashboard.service.ts`) gains:
  ```ts
  topLikedWines: { wineId: string; name: string; count: number }[]
  ```
  Built by taking **every** wine in `content.wines.items` (not just ones
  with a `WineLike` doc), joining in its count (default 0 if absent), and
  sorting desc. This is the full product list, always — no top-N cap, so it
  keeps growing correctly as wines are added.
- New `admin/editors/_top-liked-chart.tsx`: horizontal bar chart, plain
  Tailwind (no charting library):
  - one row per wine, `bg-wine` fill, width = `count / maxCount * 100%`
    (maxCount is at least 1 to avoid divide-by-zero when all counts are 0)
  - direct labels: wine name (left of/above bar), count (bar end) — the
    number is always visible as text, not only encoded in bar length
  - container: `max-h-96 overflow-y-auto` so it scales past however many
    wines fit on screen, instead of truncating
  - single measure, single hue, no legend/tooltip needed (matches existing
    `--color-wine` used throughout admin already — no new palette)
- `dashboard-editor.tsx` renders `<TopLikedChart wines={stats.topLikedWines} />`
  below the existing stat tiles.

## Targeted fix — wine id stability

`wines-editor.tsx`'s `addWine` generates `id: wine-${items.length + 1}`.
After a delete + re-add, a new wine can be assigned an id a previous wine
already used, silently inheriting its old `WineLike` count (since `wineId`
is the join key for likes). Fix: generate with `crypto.randomUUID()` instead
of the length-based scheme. One-line change, `_wine-row.tsx`/`WineItem` type
unaffected (still `string`).

## Testing

- `wine-like.repository.spec.ts` — mock `mongo.connect` + model, per §14
  pattern used elsewhere in the repo.
- `wine-like.service.spec.ts` — mock repository boundary (`vi.mock('@/features/wine-likes/repository/wine-like.repository')`).
- `admin-dashboard.service.spec.ts` — extend existing spec to cover the new
  `topLikedWines` join logic (all-wines-included, sorted, 0-count default).
- Component test for `WineLikeButton` optional (existing repo doesn't test
  every component; skip unless trivial).
