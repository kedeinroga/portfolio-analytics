// Load environment variables based on NODE_ENV
// Note: Firebase App Hosting automatically provides environment variables from apphosting.yaml
// Only load .env files in development (local) environment
if (process.env.NODE_ENV !== 'production') {
  const envFile = '.env.local';
  require('dotenv').config({ path: `./${envFile}` });
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
  ...(process.env.NODE_ENV === 'production' && {
    output: 'standalone',
    trailingSlash: false,
  }),
  
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
