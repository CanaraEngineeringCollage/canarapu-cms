// middleware.ts in CMS project

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// middleware.ts in CMS project

export default async function middleware(req: any, event: any) {
  const { pathname } = req.nextUrl;
  const { method } = req;

  // 1. PUBLIC BYPASS
  const isPublicApi = 
    pathname.startsWith("/api/inquiry") || 
    pathname.startsWith("/api/exam-circulars") ||
    pathname.startsWith("/api/events") ||
    pathname.startsWith("/api/question-papers")|| // Added Question Papers
    pathname.startsWith("/api/magazines")||
    pathname.startsWith("/api/buzz")||
    pathname.startsWith("/api/academic-toppers")||
    pathname.startsWith("/api/non-academic-toppers");


  if (isPublicApi) {
    // Only allow GET and OPTIONS for these routes (and POST for inquiries)
    const isReadRequest = method === "GET" || method === "OPTIONS";
    const isInquiryPost = pathname.startsWith("/api/inquiry") && method === "POST";

    if (isReadRequest || isInquiryPost) {
      return NextResponse.next();
    }
  }

  // 2. AUTHENTICATED ROUTES
  const authMiddleware = withAuth({
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  });

  return authMiddleware(req, event);
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon.png|uploads|login).*)",
  ],
};