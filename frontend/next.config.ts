import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb' // Increase from default 1mb to 10mb
    }
  },
  outputFileTracingRoot: '/Users/prestoneaton/QuickFlip_MVP/Accorria/frontend'
};

export default nextConfig;
