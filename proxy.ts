import { NextResponse, type NextRequest } from 'next/server';

// One codebase, two servers. APP_MODE (set by the dev:* scripts in package.json)
// decides which half this process answers; the other half gets a 404.
//   storefront -> everything except /admin
//   admin      -> /admin only, and `/` goes to the admin dashboard
//   unset      -> everything, as before
// Admin Server Actions are POSTs to their page's URL, so this covers them too, but
// requireAdmin() in each action stays the check that actually protects the data.

const isAdminPath = (pathname: string) => pathname === '/admin' || pathname.startsWith('/admin/');

// Static files the admin pages show: the logo at the root of public/, and product photos
// under /products (the admin product list and form display them).
const isPublicAsset = (pathname: string) => /^\/[^/]+\.[A-Za-z0-9]+$/.test(pathname) || /^\/products\/[^/]+\.[A-Za-z0-9]+$/.test(pathname);

function notFound(request: NextRequest) {
  // A path with no route makes the app render its 404 page with a 404 status.
  return NextResponse.rewrite(new URL('/_not-found-in-this-app', request.url));
}

export function proxy(request: NextRequest) {
  const mode = process.env.APP_MODE;
  const { pathname } = request.nextUrl;

  // Dev-server internals (HMR, error overlay) must always get through.
  if (pathname.startsWith('/_next/') || pathname.startsWith('/__nextjs')) {
    return NextResponse.next();
  }

  if (mode === 'storefront' && isAdminPath(pathname)) {
    return notFound(request);
  }

  if (mode === 'admin') {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (!isAdminPath(pathname) && !isPublicAsset(pathname)) {
      return notFound(request);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
