import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude Supabase directory from webpack compilation
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  
  // Disable static generation for client-side only pages
  experimental: {
    // Disable static optimization
    workerThreads: false,
  },
};

export default nextConfig;
