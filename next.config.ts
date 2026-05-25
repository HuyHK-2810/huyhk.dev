import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkFrontmatter from "remark-frontmatter";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkFrontmatter],
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
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
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
};

export default withMDX(nextConfig);
