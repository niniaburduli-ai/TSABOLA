import { NextRequest, NextResponse } from 'next/server';

import { galleryRepository } from '@/features/gallery/repository/gallery.repository';
import { addGalleryImage } from '@/features/gallery/service/gallery.service';

const SEED_SECRET = 'tsabola-seed-2026';

const GALLERY_IMAGES = [
  {
    url: 'https://res.cloudinary.com/dm8ksdiiq/image/upload/v1782764366/tsabola/gallery/gallery-rtveli-.png',
    publicId: 'tsabola/gallery/gallery-rtveli-',
  },
  {
    url: 'https://res.cloudinary.com/dm8ksdiiq/image/upload/v1782764255/tsabola/gallery/gallery-white.png',
    publicId: 'tsabola/gallery/gallery-white',
  },
  {
    url: 'https://res.cloudinary.com/dm8ksdiiq/image/upload/v1782764272/tsabola/gallery/gallery-red.png',
    publicId: 'tsabola/gallery/gallery-red',
  },
  {
    url: 'https://res.cloudinary.com/dm8ksdiiq/image/upload/v1782764337/tsabola/gallery/gallery-supra.png',
    publicId: 'tsabola/gallery/gallery-supra',
  },
];

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }

  const results = [];
  const existing = await galleryRepository.findAll();
  const existingIds = new Set(existing.map((img) => img.publicId));

  for (const img of GALLERY_IMAGES) {
    if (existingIds.has(img.publicId)) {
      results.push({ url: img.url, status: 'already_exists' });
      continue;
    }
    await addGalleryImage(img.url, img.publicId);
    results.push({ url: img.url, status: 'created' });
  }

  return NextResponse.json({ results });
}
