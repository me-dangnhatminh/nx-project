const { composePlugins, withNx } = require('@nx/next');
const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = withBundleAnalyzer({
  nx: { svgr: false },
  headers: async () => {
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
