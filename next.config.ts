// Load environment variables only in development
// Firebase App Hosting provides environment variables from apphosting.yaml in production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: './.env.local' });
}

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Environment variables - Firebase App Hosting handles these automatically
  // No need to explicitly define them here as they're set in apphosting.yaml
  
  // Output configuration for Firebase App Hosting
  // Note: Firebase App Hosting handles deployment, no need for 'standalone' output
  trailingSlash: false,
  
  // Webpack configuration to handle path aliases (critical for Firebase App Hosting)
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Ensure path aliases are properly resolved
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    
    config.resolve.alias['@'] = require('path').resolve(__dirname, 'src');
    
    return config;
  },
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? process.env.NEXT_PUBLIC_APP_URL || '*' 
              : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Forwarded-For, X-Real-IP, X-Client-IP, CF-Connecting-IP',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kedeinroga.github.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
