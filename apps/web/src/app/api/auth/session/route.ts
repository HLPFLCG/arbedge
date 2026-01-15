export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-edge';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret';
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
