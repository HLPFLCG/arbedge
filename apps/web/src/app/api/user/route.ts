export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db-edge';
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from '@/lib/api-utils';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const sql = getDb();

    const users = await sql`
      SELECT
        u.id, u.email, u.name, u.image, u."createdAt",
        s.tier as "subscriptionTier", s.status as "subscriptionStatus",
        s."currentPeriodEnd" as "subscriptionExpires"
      FROM users u
      LEFT JOIN subscriptions s ON s."userId" = u.id
      WHERE u.id = ${user.id}
    `;

    if (users.length === 0) {
      return errorResponse('User not found', 404);
    }

    return successResponse({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse('Failed to get user');
  }
}

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

export async function PATCH(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { name, email } = updateUserSchema.parse(body);

    if (!name && !email) {
      return errorResponse('No fields to update', 400);
    }

    const sql = getDb();
    const now = new Date().toISOString();

    // Check if email is already taken
    if (email && email !== user.email) {
      const existing = await sql`SELECT id FROM users WHERE email = ${email} AND id != ${user.id}`;
      if (existing.length > 0) {
        return errorResponse('Email already in use', 400);
      }
    }

    // Build update query
    const updates = [];
    const values: any = { id: user.id, now };

    if (name) {
      values.name = name;
    }
    if (email) {
      values.email = email;
    }

    await sql`
      UPDATE users
      SET
        name = COALESCE(${name || null}, name),
        email = COALESCE(${email || null}, email),
        "updatedAt" = ${now}
      WHERE id = ${user.id}
    `;

    return successResponse({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid input', 400);
    }
    console.error('Update user error:', error);
    return errorResponse('Failed to update user');
  }
}
