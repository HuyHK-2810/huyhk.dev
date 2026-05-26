import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Don't fail prod builds on lint warnings; lint runs separately via `next lint`.
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
