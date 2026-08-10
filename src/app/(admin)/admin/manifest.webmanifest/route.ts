import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json(
    {
      name: 'Tsabola Admin',
      short_name: 'Admin',
      description: 'Tsabola site content admin panel',
      start_url: '/admin',
      scope: '/admin',
      display: 'standalone',
      background_color: '#faf8f5',
      theme_color: '#722f37',
      icons: [
        { src: '/icons/192?label=A', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/512?label=A', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/512?label=A&maskable=1', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    { headers: { 'Content-Type': 'application/manifest+json' } }
  );
}
