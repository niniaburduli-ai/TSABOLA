import { NextRequest, NextResponse } from 'next/server';

import { getSiteContent, saveSiteContent } from '@/features/tsabola/service/site-content.service';
import { SaveSiteContentSchema } from '@/features/tsabola/validations/site-content.validation';
import { auth } from '@/shared/lib/auth';
import { validateBody } from '@/shared/middleware/validate-body';

export async function GET() {
  try {
    const result = await getSiteContent();
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const validated = await validateBody(req, SaveSiteContentSchema);
    if (validated instanceof NextResponse) return validated;

    const result = await saveSiteContent(validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
