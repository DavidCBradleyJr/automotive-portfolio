import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // No images.remotePatterns -- CldImage handles Cloudinary directly
  // No output: 'export' -- full server mode for future API routes
};

export default nextConfig;
