export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db-edge';
import { hashPassword, verifyPassword } from '@/lib/auth-edge';
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from '@/lib/api-utils';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { currentPassword, newPassword } = passwordSchema.parse(body);

    const sql = getDb();

    // Get current password hash
    const users = await sql`
      SELECT "passwordHash" FROM users WHERE id = ${user.id}
    `;

    if (users.length === 0) {
      return errorResponse('User not found', 404);
    }

    const { passwordHash } = users[0];

    if (!passwordHash) {
      return errorResponse('Cannot change password for OAuth accounts', 400);
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, passwordHash);
    if (!isValid) {
      return errorResponse('Current password is incorrect', 400);
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    const now = new Date().toISOString();

    // Update password
    await sql`
      UPDATE users
      SET "passwordHash" = ${newPasswordHash}, "updatedAt" = ${now}
      WHERE id = ${user.id}
    `;

    return successResponse({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid input', 400);
    }
    console.error('Password update error:', error);
    return errorResponse('Failed to update password');
  }
}
