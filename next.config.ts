import type { NextConfig } from "next";

let loaderPath: string | undefined;
try {
  loaderPath = require.resolve('orchids-visual-edits/loader.js');
} catch {
  // loader not available in production build
}

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-no-referrer' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), accelerometer=()' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel.com blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https: wss:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      // DiceBear avatars (fallback for users without a profile photo)
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/7.x/**',
      },
    ],
    // All user-uploaded media is served through /api/media (our authenticated proxy),
    // so no external Supabase storage hostname is needed here.
  },
  async redirects() {
      return [
        {
          source: '/notifications',
          destination: '/alerts',
          permanent: true,
        },
      ];
    },
};

export default nextConfig;
// Orchids restart: 1770870689662
