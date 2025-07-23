import { NextRequest, NextResponse } from 'next/server';

export const middleware = (request: NextRequest) => {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  // Redirect logged-in users away from login/register
  if ((pathname === '/login' || pathname === '/register') && token && role) {
    const redirectUrl =
      role === 'buyer'
        ? new URL('/dashboard', request.url)
        : new URL('/seller', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Buyer route protection
  if (pathname.startsWith('/dashboard')) {
    if (!token || role !== 'buyer') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Seller route protection
  if (pathname.startsWith('/seller')) {
    if (!token || role !== 'seller') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Profile route protection
if (pathname.startsWith('/profile') || pathname.startsWith('/books')) {
  if (!token) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
}


  return NextResponse.next();
};

export const config = {
  matcher: [
    '/login',
    '/register',
    '/seller/:path*',
    '/dashboard/:path*',
    '/profile/:path*', 
    '/books/:path*',
  ],
};
