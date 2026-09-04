import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "natnvyrukhheaaksfaug.supabase.co",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Increase body size limit for Server Actions (for file uploads)
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // Allow up to 50MB for video uploads
    },
  },
  // Empty turbopack config to silence webpack config warning
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Fix for Tailwind CSS trying to import Node.js modules in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        v8: false,
        module: false,
      };
    }
    return config;
  },
};

export default nextConfig;
