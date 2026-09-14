import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { JWT } from 'next-auth/jwt';

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith('/admin')) {
      const token = req.nextauth.token as JWT & { role?: string };

      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    if (pathname.startsWith('/client') || pathname.startsWith('/freelancer') || pathname.startsWith('/dashboard') || pathname.startsWith('/messages')) {
      const token = req.nextauth.token as JWT & { role?: string };
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        if (pathname === '/' || pathname === '/login' || pathname === '/register') {
          return true;
        }

        if (pathname.startsWith('/admin')) {
          return !!token && token.role === 'ADMIN';
        }

        if (pathname.startsWith('/client') || pathname.startsWith('/freelancer') || pathname.startsWith('/dashboard') || pathname.startsWith('/messages')) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/client/:path*',
    '/dashboard/:path*',
    '/freelancer/:path*',
    '/messages/:path*',
    '/profile/:path*',
  ],
};
