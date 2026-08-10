import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

export const contentType = 'image/png';

const CHARCOAL = '#1a1a1a';
const SIZES = [16, 32, 48, 64, 128, 256];

export function generateImageMetadata() {
  return SIZES.map((px) => ({
    id: String(px),
    size: { width: px, height: px },
    contentType,
  }));
}

export default function Icon({ id }: { id: string }) {
  const px = SIZES.includes(Number(id)) ? Number(id) : 32;
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
          width={px * 0.82}
          height={px * 0.82}
          alt=""
        />
      </div>
    ),
    { width: px, height: px }
  );
}
