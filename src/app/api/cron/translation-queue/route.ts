import { NextRequest, NextResponse } from 'next/server';

import { processTranslationQueue } from '@/features/translation-queue/service/translation-queue.service';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  try {
    const result = await processTranslationQueue();
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
