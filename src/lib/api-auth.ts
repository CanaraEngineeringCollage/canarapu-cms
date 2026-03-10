import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Call this at the top of any protected API route handler.
 * Returns the decoded JWT token if session is valid.
 * Returns a 401 NextResponse if not authenticated.
 */
export async function requireAuth(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return {
      token: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { token, error: null };
}
