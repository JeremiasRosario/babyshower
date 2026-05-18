import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'bebemundo.com.do' },
      { protocol: 'https', hostname: 'www.amazon.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
    ],
  },
};

export default nextConfig;
