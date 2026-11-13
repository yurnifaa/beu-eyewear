import type { NextConfig } from "next";

// One codebase, two dev servers. APP_MODE (set by the dev:* scripts in package.json) decides which
// half a server answers; the other half gets a 404. This used to be proxy.ts, but a proxy is a
// function that runs in front of every request in production too (pages, API calls, even images),
// to do nothing. Redirects and rewrites are applied by the router itself, with no function involved.
//   storefront -> everything except /admin
//   admin      -> /admin only, and `/` goes to the admin dashboard
//   unset      -> everything (production)
// Admin Server Actions are POSTs to their page's URL, so this covers them too, but requireAdmin()
// in each action stays the check that actually protects the data.
const mode = process.env.APP_MODE;

// A path with no route makes the app render its 404 page with a 404 status.
const NOT_FOUND = '/_not-found-in-this-app';

// In admin mode everything that isn't the admin app 404s, except what the admin pages themselves
// load: dev-server internals, root-level files in public/ (the logo), and product photos under
// /products.
const NOT_ADMIN = '/:path((?!admin(?:/|$)|_next/|__nextjs|[^/]+\\.[A-Za-z0-9]+$|products/[^/]+\\.[A-Za-z0-9]+$).*)';

// Security headers for every response. The Content-Security-Policy has no per-request nonce on
// purpose: a nonce needs a function in front of every request and makes every page dynamic, which is
// what the performance pass removed. So scripts allow 'unsafe-inline' (Next's own bootstrap scripts
// are inline), and this policy does NOT stop an injected inline script. What it does do: block
// scripts, objects and frames from other origins, <base> and form hijacking, framing of the site,
// and data being sent to other origins. Dev needs 'unsafe-eval' (React's debugging) and websockets
// (hot reload). Everything the pages load comes from this origin, except product photos that sit in
// Vercel Blob.
const isDev = process.env.NODE_ENV !== 'production';

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // Keeps ?token= links (email verification, password reset) out of the Referer sent to other sites.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // One year, this exact host only (no includeSubDomains), so it can't affect other subdomains.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
];

const nextConfig: NextConfig = {
  // Don't announce the framework in an X-Powered-By header.
  poweredByHeader: false,
  // The admin app runs next to the storefront from this same folder.
  // `next dev` locks its output folder, so it needs its own.
  distDir: mode === 'admin' ? '.next-admin' : '.next',
  images: {
    // Product photos uploaded from the admin live in Vercel Blob.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
    // AVIF is smaller than WebP at the same quality; browsers without it get WebP automatically.
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Pages are rendered per request, and the client router's default is to throw its copy away
    // immediately, so going back or revisiting a page re-fetches it from the server. Keep a visited
    // page for 30s instead. Server Actions that call revalidatePath still clear it, and the cart,
    // wishlist and badges live in the browser, so none of those can go stale.
    staleTimes: { dynamic: 30 },
  },
  async redirects() {
    return [{ source: '/', destination: mode === 'admin' ? '/admin' : '/home', permanent: false }];
  },
  async rewrites() {
    const beforeFiles =
      mode === 'storefront'
        ? [{ source: '/admin/:path*', destination: NOT_FOUND }]
        : mode === 'admin'
          ? [{ source: NOT_ADMIN, destination: NOT_FOUND }]
          : [];
    return { beforeFiles, afterFiles: [], fallback: [] };
  },
  // Files in public/ default to "revalidate on every visit", which costs a round trip per logo on a
  // slow connection. A week is safe: names aren't hashed, so a replaced file shows up within a
  // week at most (rename it to ship a change sooner). The patterns match root-level files and
  // /products only, so the already-immutable /_next/static assets are left alone.
  async headers() {
    const cache = [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }];
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/:file(.+\\.(?:svg|png|webp|avif|ico))', headers: cache },
      { source: '/products/:file(.+\\.(?:png|jpg|jpeg|webp|avif))', headers: cache },
    ];
  },
};

export default nextConfig;
