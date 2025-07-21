// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ['/login', '/register'];
  const isPublicPath = publicPaths.includes(pathname);

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/register', request.url));
  }

  if (token && isPublicPath) {
    const redirectPath = role === 'seller' ? '/seller' : '/dashboard';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/((?!_next|favicon|api|static|images).*)'],
};
