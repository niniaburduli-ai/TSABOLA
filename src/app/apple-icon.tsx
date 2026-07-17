import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#722f37',
        }}
      >
        <span
          style={{
            fontSize: size.width * 0.5,
            fontWeight: 700,
            color: '#faf8f5',
            fontFamily: 'sans-serif',
          }}
        >
          T
        </span>
      </div>
    ),
    { ...size }
  );
}
