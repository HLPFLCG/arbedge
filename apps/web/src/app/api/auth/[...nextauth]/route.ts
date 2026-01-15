export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

// Redirect old NextAuth routes to our custom auth
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname;

  // Handle signout
  if (path.includes('signout')) {
    const response = NextResponse.redirect(new URL('/login', url.origin));
    response.cookies.set('auth-token', '', { maxAge: 0, path: '/' });
    return response;
  }

  // Handle session check
  if (path.includes('session')) {
    return NextResponse.redirect(new URL('/api/auth/session', url.origin));
  }

  // Default redirect to login
  return NextResponse.redirect(new URL('/login', url.origin));
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname;

  // Handle signout
  if (path.includes('signout')) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth-token', '', { maxAge: 0, path: '/' });
    return response;
  }

  // Handle callback (login)
  if (path.includes('callback')) {
    return NextResponse.redirect(new URL('/api/auth/login', url.origin));
  }

  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
