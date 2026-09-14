import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Turbopack configuration for monorepo/complex project structures
  // Automatically detected by Next.js via lockfiles, but explicit config helps with edge cases
  ...(process.env.NODE_ENV === 'production' && {
    turbopack: {
      // Let Next.js auto-detect the root in production
    },
  }),
};

export default nextConfig;
