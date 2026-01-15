export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getDb, generateId } from '@/lib/db-edge';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const sql = getDb();

    // Check if user exists
    const users = await sql`SELECT id FROM users WHERE email = ${email}`;

    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a reset link will be sent.',
      });
    }

    // Generate reset token
    const token = generateId() + generateId(); // 64 char token
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Delete any existing tokens for this email
    await sql`DELETE FROM verification_tokens WHERE identifier = ${email}`;

    // Store token
    await sql`
      INSERT INTO verification_tokens (identifier, token, expires)
      VALUES (${email}, ${token}, ${expires})
    `;

    // In production, send email here
    // For now, log the token (remove in production!)
    console.log(`Password reset token for ${email}: ${token}`);

    // TODO: Send email with reset link
    // await sendEmail({
    //   to: email,
    //   subject: 'Reset your password',
    //   body: `Click here to reset your password: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`,
    // });

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a reset link will be sent.',
      // Remove this in production - only for development
      ...(process.env.NODE_ENV === 'development' && { devToken: token }),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
