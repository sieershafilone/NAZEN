import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true, // For now, to avoid issues with local backend if needed
  },
};

export default nextConfig;
