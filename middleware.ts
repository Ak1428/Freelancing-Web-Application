import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { JWT } from "next-auth/jwt";

export default withAuth(
  function middleware(req) {
    // Check for admin-only routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const token = req.nextauth.token as JWT & { role?: string };
      
      if (token?.role !== 'ADMIN') {
        // Redirect to home page if not admin
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to homepage, login, and register pages
        if (req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname === '/login' ||
            req.nextUrl.pathname === '/register') {
          return true;
        }
        // Require authentication for all other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|api/public|_next/static|_next/image|favicon.ico).*)',
  ],
};
