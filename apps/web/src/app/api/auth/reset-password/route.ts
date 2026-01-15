export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-edge';
import { hashPassword } from '@/lib/auth-edge';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const sql = getDb();

    // Find valid token
    const tokens = await sql`
      SELECT identifier, expires
      FROM verification_tokens
      WHERE token = ${token}
    `;

    if (tokens.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const { identifier: email, expires } = tokens[0];

    // Check if token is expired
    if (new Date(expires) < new Date()) {
      // Clean up expired token
      await sql`DELETE FROM verification_tokens WHERE token = ${token}`;
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Find user
    const users = await sql`SELECT id FROM users WHERE email = ${email}`;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    // Update password
    await sql`
      UPDATE users
      SET "passwordHash" = ${passwordHash}, "updatedAt" = ${now}
      WHERE email = ${email}
    `;

    // Delete used token
    await sql`DELETE FROM verification_tokens WHERE token = ${token}`;

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
