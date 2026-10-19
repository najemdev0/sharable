import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

function getJwtSecret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error('JWT_SECRET environment variable is required.');
  return new TextEncoder().encode(value);
}

const publicPaths = [
  '/',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/community-guidelines',
  '/favicon.ico',
  '/manifest.json',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
  '/api/auth/session',
  '/api/auth/logout',
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public paths and static files
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('sb-auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    await jwtVerify(token, getJwtSecret());
    return NextResponse.next();
  } catch (error) {
    // If token is invalid, redirect to landing page
    const response = NextResponse.redirect(new URL('/', req.url));
    response.cookies.delete('sb-auth-token');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
