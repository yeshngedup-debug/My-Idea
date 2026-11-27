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
    // The landing page lives at /public. Redirect at the server, before any
    // rendering starts: a page-level permanentRedirect() is thrown after the
    // shell has flushed, so the root URL used to answer 200 with a loading
    // skeleton and only redirect after JavaScript ran. This keeps the first
    // paint of "/" a real 308 instead of an empty shell.
    return [
      {
        source: '/',
        destination: '/public',
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
