import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - /login (auth page)
     * - /api/auth/* (NextAuth internals)
     * - /api/buzz GET, /api/events GET, etc. (handled per-route)
     * - /_next (Next.js internals)
     * - /public files
     */
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico|icon.png|uploads).*)',
  ],
};
