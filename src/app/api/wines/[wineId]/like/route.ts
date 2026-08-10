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
