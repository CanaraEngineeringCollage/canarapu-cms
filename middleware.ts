// middleware.ts in CMS project

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// middleware.ts in CMS project

export default async function middleware(req: any, event: any) {
  const { pathname } = req.nextUrl;
  const { method } = req;

  // 1. PUBLIC BYPASS
 const publicApis = [
  "/api/inquiry",
  "/api/exam-circulars",
  "/api/events",
  "/api/question-papers",
  "/api/magazines",
  "/api/buzz",
  "/api/academic-toppers",
  "/api/non-academic-toppers",
];

const isPublicApi = publicApis.some(route => pathname.startsWith(route));

if (isPublicApi && (method === "GET" || method === "OPTIONS")) {
  return NextResponse.next();
}

// allow public POST for inquiry
if (pathname.startsWith("/api/inquiry") && method === "POST") {
  return NextResponse.next();
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