export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS, getAppUrl } from '@/lib/auth-config';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(AUTH_COOKIE_NAME, '', {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}

export async function GET() {
  const response = NextResponse.redirect(new URL('/login', getAppUrl()));

  response.cookies.set(AUTH_COOKIE_NAME, '', {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}
