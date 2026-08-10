import { ImageResponse } from 'next/og';

import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const ALLOWED_SIZES = [192, 512];
const CREAM = '#faf8f5';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await params;
  const size = ALLOWED_SIZES.includes(Number(sizeParam)) ? Number(sizeParam) : 192;
  const maskable = req.nextUrl.searchParams.get('maskable') === '1';
  const label = req.nextUrl.searchParams.get('label')?.slice(0, 1).toUpperCase();
  const logoScale = maskable ? 0.62 : 0.82;
  const logoUrl = new URL('/logo.png', req.nextUrl.origin).toString();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: CREAM,
        }}
      >
        {label ? (
          <span
            style={{
              fontSize: size * 0.5,
              fontWeight: 700,
              color: '#722f37',
              fontFamily: 'sans-serif',
            }}
          >
            {label}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} width={size * logoScale} height={size * logoScale} alt="" />
        )}
      </div>
    ),
    { width: size, height: size }
  );
}
