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
