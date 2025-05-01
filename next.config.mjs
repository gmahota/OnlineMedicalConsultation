/** @type {import('next').NextConfig} */
// Set the PORT environment variable to 5000 for Replit compatibility
process.env.PORT = process.env.PORT || '5000';

const nextConfig = {
  // Configure Next.js for optimizations
  reactStrictMode: false,
  
  // Trailing slashes should not be used in Next.js
  trailingSlash: false,
  
  // Configure images
  images: {
    domains: [],
  },
  
  // Configure custom webpack configuration
  webpack(config) {
    return config;
  },
  
  // Enable experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:5000', '0.0.0.0:5000'],
    },
  },
  
  // Environment variables
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  
  // Server configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // API routes configuration
  async rewrites() {
    return {
      beforeFiles: [
        // Redirect old paths to new ones if needed
      ],
      afterFiles: [
        // API rewrites
        {
          source: '/api/:path*',
          destination: '/api/:path*',
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;