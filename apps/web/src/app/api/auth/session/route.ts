export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-edge';
import { getJwtSecret, AUTH_COOKIE_NAME } from '@/lib/auth-config';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const secret = getJwtSecret();
    const payload = await verifyToken(token, secret);

    if (!payload) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        image: payload.image,
        subscriptionTier: payload.subscriptionTier,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}
