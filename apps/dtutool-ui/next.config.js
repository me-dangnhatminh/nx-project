const { composePlugins, withNx } = require('@nx/next');
const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const isDev = process.env.NODE_ENV === 'development';

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = withBundleAnalyzer({
  nx: { svgr: false },
  headers: async () => {
    if (isDev) return [];
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
});

const plugins = [withNx];

module.exports = composePlugins(...plugins)(nextConfig);
