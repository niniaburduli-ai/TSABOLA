import { APP_DESCRIPTION, APP_NAME } from '@/shared/const/app.const';

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#faf8f5',
    theme_color: '#722f37',
    icons: [
      { src: '/icons/192?bg=dark', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/512?bg=dark', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/512?maskable=1&bg=dark',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'ადმინ პანელი',
        short_name: 'Tsabola Admin',
        description: 'საიტის კონტენტის მართვა',
        url: '/admin',
        icons: [{ src: '/icons/192?bg=dark', sizes: '192x192', type: 'image/png' }],
      },
    ],
  };
}
