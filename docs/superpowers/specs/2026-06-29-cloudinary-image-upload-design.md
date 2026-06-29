# Cloudinary Image Upload — Design Spec

## Overview

Integrate Cloudinary image uploads into all admin section editors. Existing 10 public images migrated to Cloudinary. Admins can upload images via file picker; 2 MB limit enforced client- and server-side.

---

## Architecture

### New files

| File | Purpose |
|------|---------|
| `src/shared/lib/cloudinary.ts` | Cloudinary SDK singleton (OOP class, exports `cloudinary` instance) |
| `src/shared/lib/cloudinary.spec.ts` | Unit tests for singleton |
| `src/app/api/upload/route.ts` | POST endpoint — validates ≤2 MB, uploads to Cloudinary, returns `{ url: string }` |
| `src/features/tsabola/components/image-upload-button.tsx` | Reusable file picker button (client component); emits Cloudinary URL on success |

### Modified files

| File | Change |
|------|--------|
| `next.config.ts` | Add `res.cloudinary.com` to `images.remotePatterns` |
| `src/features/tsabola/content/site-content.ts` | Replace all `/public/` image paths with Cloudinary URLs (both KA + EN) |
| `src/features/tsabola/components/gallery-editor.tsx` | Add `ImageUploadButton` per image slot |
| `src/features/tsabola/components/wines-editor.tsx` | Add `ImageUploadButton` per wine |
| `src/features/tsabola/components/about-editor.tsx` | Add `ImageUploadButton` for about image |
| `src/features/tsabola/components/hero-editor.tsx` | Add `ImageUploadButton` per hero image |
| `.env` / `.env.example` | Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |

---

## Data Flow

```
User picks file (file input)
  → client validates size ≤ 2 MB → reject early if over
  → POST /api/upload (multipart FormData)
      → server validates Content-Length / buffer size ≤ 2 MB → 413 if over
      → cloudinary.uploader.upload(buffer, { folder: 'tsabola' })
      → return { url: string }  (secure_url from Cloudinary)
  → ImageUploadButton calls onUpload(url)
  → editor sets path field value to url
  → editor saves to site-content / DB as usual
```

---

## API Route — `/api/upload`

- Method: POST
- Body: `multipart/form-data` with field `file`
- Validation:
  - File present → 400 if missing
  - `file.size > 2_097_152` (2 MB) → 413
  - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/gif` → 415 if other
- Upload: `cloudinary.uploader.upload(dataUri, { folder: 'tsabola', resource_type: 'image' })`
- Response 200: `{ url: string }` (Cloudinary secure_url)
- Response errors: `{ error: string }` with appropriate status

---

## `ImageUploadButton` Component

Props:
```ts
type ImageUploadButtonProps = {
  onUpload: (url: string) => void;
  disabled?: boolean;
};
```

Behavior:
- Hidden `<input type="file" accept="image/*">`
- Visible button triggers click on input
- Client-side: if `file.size > 2_097_152` → show toast/error, abort
- POSTs to `/api/upload`, shows loading state
- On success: calls `onUpload(url)`
- On error: shows error message inline

---

## Image Migration (one-time)

Upload all 10 existing `/public/` images to Cloudinary via a migration script (`scripts/migrate-images.ts`) run with `npx tsx`. After upload, update `site-content.ts` with returned Cloudinary URLs for both KA and EN content (per MEMORY.md KA/EN sync rule).

Images to migrate:
- `/HERO RTVELI.png`
- `/HERO VENAXI.png`
- `/white wine.png`
- `/red wine.png`
- `/gallery white.png`
- `/gallery red.png`
- `/GALLERY RTVELI .png`
- `/gallery supra.png`
- `/VAZI.png`
- `/LA.PNG`

---

## 2 MB Limit Enforcement

| Layer | Mechanism |
|-------|-----------|
| Client (before upload) | `file.size > 2_097_152` → show error, do not POST |
| Server (API route) | Buffer size check → 413 response |

Both layers required — client check prevents wasted bandwidth; server check prevents bypass.

---

## Error Handling

- Missing file → 400
- File too large → 413 `{ error: 'FILE_TOO_LARGE' }`
- Wrong type → 415 `{ error: 'INVALID_FILE_TYPE' }`
- Cloudinary failure → 500 `{ error: 'UPLOAD_FAILED' }`
- Network error in component → show inline error message

---

## Testing

- `cloudinary.spec.ts`: singleton instantiates with env vars
- API route: mock `cloudinary.uploader.upload`, test 400/413/415/500 branches
- `ImageUploadButton`: render, simulate oversized file, simulate success response
