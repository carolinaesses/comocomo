import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // Define protected routes
  const protectedRoutes = [
    '/meals',
    '/diet',
    '/calendar',
    '/summary',
  ];

  // Define public routes
  const publicRoutes = [
    '/signin',
    '/favicon.ico',
  ];

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    nextUrl.pathname.startsWith(route)
  );

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route =>
    nextUrl.pathname === route
  );

  if (isProtectedRoute) {
    // Check if user is authenticated (has user data in cookies)
    const userCookie = request.cookies.get('comocomo-user');

    if (!userCookie?.value) {
      // Redirect to signin page with redirect parameter
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('redirect', nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Redirect root path to summary for authenticated users
  if (nextUrl.pathname === '/') {
    const userCookie = request.cookies.get('comocomo-user');
    if (userCookie?.value) {
      // User is authenticated, redirect to summary
      return NextResponse.redirect(new URL('/summary', request.url));
    } else {
      // User is not authenticated, redirect to signin
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('redirect', '/summary');
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
