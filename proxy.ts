import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication (prefix match)
const PROTECTED_PREFIXES = ['/dashboard'];

// Public paths — always allowed through (no auth required)
const PUBLIC_PATHS = ['/', '/auth/login', '/patient', '/track'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // For protected routes, check for session cookie / auth token
  // We use sessionStorage on the client (not accessible here), so middleware
  // does a lightweight check: if hitting /dashboard/* without a session cookie,
  // redirect to login. The ProtectedRoute component enforces role-based access.
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    // Check for our auth cookie (set on login, cleared on logout)
    const authCookie = request.cookies.get('optiflow-auth-active');
    if (!authCookie) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT static files, images, favicon
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
