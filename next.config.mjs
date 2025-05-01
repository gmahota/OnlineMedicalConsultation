/** @type {import('next').NextConfig} */
// Set the PORT environment variable to 5000 for Replit compatibility
process.env.PORT = '5000';

// Log the port configuration
console.log('Next.js configured to run on PORT:', process.env.PORT);

// Force listening on all interfaces (0.0.0.0) at port 5000
process.env.HOST = '0.0.0.0';

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
      allowedOrigins: ['localhost:3000', 'localhost:5000', '0.0.0.0:5000', '*.replit.dev', '*.repl.co'],
    }
  },
  
  // Environment variables
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  
  // CORS configuration for Replit
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
          // Allow requests from Replit domains
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
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
        // WebSocket rewrite for video consultations
        {
          source: '/ws',
          destination: '/ws',
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;