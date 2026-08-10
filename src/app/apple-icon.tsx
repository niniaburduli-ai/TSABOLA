import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const CHARCOAL = '#1a1a1a';

export default function AppleIcon() {
  const logo = readFileSync(join(process.cwd(), 'public/logo.png')).toString('base64');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: CHARCOAL,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${logo}`}
          width={size.width * 0.82}
          height={size.height * 0.82}
          alt=""
        />
      </div>
    ),
    { ...size }
  );
}
