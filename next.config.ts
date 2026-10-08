import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photos uploaded from the admin live in Vercel Blob.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  experimental: {
    // Product photos are uploaded through a Server Action. The image limit is
    // 4 MB (lib/storage/product-image.ts); the extra covers the form's other fields.
    serverActions: { bodySizeLimit: '5mb' },
  },
};

export default nextConfig;
