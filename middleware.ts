import { withAuth } from "next-auth/middleware";

export default withAuth(
  () => {},
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
