import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Lets the dev server's HMR websocket accept connections from phones/other devices
  // testing over LAN — without this, Next only trusts localhost and silently fails the
  // HMR handshake, which forces repeat remounts and breaks anything stateful (e.g. the
  // hero's typewriter effect gets stuck at 0 chars) while static text renders fine.
  allowedDevOrigins: ['192.168.1.2'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },
};

export default nextConfig;
