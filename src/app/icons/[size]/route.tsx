import { ImageResponse } from 'next/og';

import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const ALLOWED_SIZES = [192, 512];
const WINE = '#722f37';
const CREAM = '#faf8f5';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await params;
  const size = ALLOWED_SIZES.includes(Number(sizeParam)) ? Number(sizeParam) : 192;
  const maskable = req.nextUrl.searchParams.get('maskable') === '1';
  const fontSize = maskable ? size * 0.32 : size * 0.5;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: WINE,
        }}
      >
        <span
          style={{
            fontSize,
            fontWeight: 700,
            color: CREAM,
            fontFamily: 'sans-serif',
          }}
        >
          T
        </span>
      </div>
    ),
    { width: size, height: size }
  );
}
