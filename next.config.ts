// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // CV and payment-proof uploads allow 5 MB files. The default Server Action
    // body cap is 1 MB, so leave room for multipart metadata above the file.
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
  allowedDevOrigins: ['192.168.56.1', 'localhost'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  turbopack: {},
  webpack: (config: Parameters<NonNullable<import('next').NextConfig['webpack']>>[0]) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
  async redirects() {
    // "/" is the canonical landing URL. Keep /public as a compatibility alias
    // for old links and bookmarks; Next forwards the query string on redirect.
    return [
      {
        source: '/public',
        destination: '/',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
