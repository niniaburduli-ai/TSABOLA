import { NextRequest, NextResponse } from 'next/server';

import { listGalleryImages, addGalleryImage } from '@/features/gallery/service/gallery.service';
import { GalleryImageSchema } from '@/features/gallery/validations/gallery.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

export async function GET() {
  try {
    const result = await listGalleryImages();
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const validated = await validateBody(req, GalleryImageSchema);
    if (validated instanceof NextResponse) return validated;

    const result = await addGalleryImage(validated.data.url, validated.data.publicId);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
