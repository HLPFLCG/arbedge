export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getDb, generateId } from '@/lib/db-edge';
import { hashPassword } from '@/lib/auth-edge';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const sql = getDb();

    // Check if user already exists
    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password using Edge-compatible function
    const passwordHash = await hashPassword(password);

    // Generate IDs
    const userId = generateId();
    const subscriptionId = generateId();
    const portfolioId = generateId();
    const now = new Date().toISOString();
    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Create user
    await sql`
      INSERT INTO users (id, email, "passwordHash", name, "createdAt", "updatedAt")
      VALUES (${userId}, ${email}, ${passwordHash}, ${name}, ${now}, ${now})
    `;

    // Create subscription
    await sql`
      INSERT INTO subscriptions (id, "userId", tier, status, "currentPeriodStart", "currentPeriodEnd", "createdAt", "updatedAt")
      VALUES (${subscriptionId}, ${userId}, 'STARTER', 'TRIALING', ${now}, ${trialEnd}, ${now}, ${now})
    `;

    // Create portfolio
    await sql`
      INSERT INTO portfolios (id, "userId", "totalBankroll", currency, "createdAt", "updatedAt")
      VALUES (${portfolioId}, ${userId}, 0, 'USD', ${now}, ${now})
    `;

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: email,
        name: name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
