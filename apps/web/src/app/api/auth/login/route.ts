export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-edge';
import { verifyPassword, createToken } from '@/lib/auth-edge';
import { getJwtSecret, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS, JWT_EXPIRY_DAYS } from '@/lib/auth-config';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const sql = getDb();

    // Get user
    const users = await sql`
      SELECT u.id, u.email, u.name, u.image, u."passwordHash", s.tier as "subscriptionTier"
      FROM users u
      LEFT JOIN subscriptions s ON s."userId" = u.id
      WHERE u.email = ${email}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const secret = getJwtSecret();
    const token = await createToken(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        subscriptionTier: user.subscriptionTier || 'FREE',
      },
      secret
    );

    // Set cookie and return user
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        subscriptionTier: user.subscriptionTier || 'FREE',
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      ...AUTH_COOKIE_OPTIONS,
      maxAge: JWT_EXPIRY_DAYS * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
