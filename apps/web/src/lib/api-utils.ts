// API utilities for Edge Runtime

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-edge';
import { getJwtSecret, AUTH_COOKIE_NAME } from '@/lib/auth-config';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  subscriptionTier: string;
}

export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const secret = getJwtSecret();
    const payload = await verifyToken(token, secret);
    if (!payload) return null;

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      image: payload.image,
      subscriptionTier: payload.subscriptionTier,
    };
  } catch {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse<T>(data: T) {
  return NextResponse.json(data);
}
