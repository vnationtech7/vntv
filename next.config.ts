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
