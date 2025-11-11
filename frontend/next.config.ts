import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb' // Increase from default 1mb to 10mb
    }
  },
  // Set outputFileTracingRoot to current directory (frontend) to fix workspace detection
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
