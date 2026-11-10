import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The admin app runs next to the storefront from this same folder (see proxy.ts).
  // `next dev` locks its output folder, so it needs its own.
  distDir: process.env.APP_MODE === 'admin' ? '.next-admin' : '.next',
  images: {
    // Product photos uploaded from the admin live in Vercel Blob.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
    // AVIF is smaller than WebP at the same quality; browsers without it get WebP automatically.
    formats: ['image/avif', 'image/webp'],
  },
  // Files in public/ default to "revalidate on every visit", which costs a round trip per logo on a
  // slow connection. A week is safe: names aren't hashed, so a replaced file shows up within a
  // week at most (rename it to ship a change sooner). The patterns match root-level files and
  // /products only, so the already-immutable /_next/static assets are left alone.
  async headers() {
    const cache = [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }];
    return [
      { source: '/:file(.+\\.(?:svg|png|webp|avif|ico))', headers: cache },
      { source: '/products/:file(.+\\.(?:png|jpg|jpeg|webp|avif))', headers: cache },
    ];
  },
};

export default nextConfig;
