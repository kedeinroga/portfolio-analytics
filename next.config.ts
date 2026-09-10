import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  trailingSlash: false,

  // Webpack configuration to handle path aliases
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ensure path aliases are properly resolved
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }

    config.resolve.alias['@'] = require('path').resolve(__dirname, 'src');

    return config;
  },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
