import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // The hosted vinext image endpoint currently rejects these local assets.
    // Serve the already-compressed WebP files directly instead.
    unoptimized: true,
  },
};

export default nextConfig;
