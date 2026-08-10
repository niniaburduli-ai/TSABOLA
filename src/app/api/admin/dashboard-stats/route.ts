import { NextResponse } from 'next/server';

import { getAdminDashboardStats } from '@/features/tsabola/service/admin-dashboard.service';
import { auth } from '@/shared/lib/auth';

type SessionUser = { role?: 'admin' | 'user' };

export async function GET() {
  try {
    const session = await auth();
    const sessionUser = session?.user as SessionUser | undefined;
    if (!session || sessionUser?.role !== 'admin') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const result = await getAdminDashboardStats();
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
