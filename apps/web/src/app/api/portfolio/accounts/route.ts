export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { getDb, generateId } from '@/lib/db-edge';
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from '@/lib/api-utils';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const sql = getDb();

    const accounts = await sql`
      SELECT
        sa.id, sa.username, sa.balance, sa.status, sa.notes,
        sa."createdAt", sa."updatedAt",
        sb.id as "sportsbookId", sb.name as "sportsbookName", sb.slug as "sportsbookSlug"
      FROM sports_accounts sa
      JOIN sportsbooks sb ON sb.id = sa."sportsbookId"
      WHERE sa."userId" = ${user.id}
      ORDER BY sb.name
    `;

    return successResponse({
      accounts: accounts.map(a => ({
        ...a,
        balance: a.balance ? parseFloat(a.balance) : null,
      })),
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    return errorResponse('Failed to get accounts');
  }
}

const createAccountSchema = z.object({
  sportsbookId: z.string().min(1),
  username: z.string().optional(),
  balance: z.number().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { sportsbookId, username, balance, notes } = createAccountSchema.parse(body);

    const sql = getDb();

    // Check if account already exists
    const existing = await sql`
      SELECT id FROM sports_accounts
      WHERE "userId" = ${user.id} AND "sportsbookId" = ${sportsbookId}
    `;

    if (existing.length > 0) {
      return errorResponse('Account already exists for this sportsbook', 400);
    }

    const id = generateId();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO sports_accounts (id, "userId", "sportsbookId", username, balance, notes, "createdAt", "updatedAt")
      VALUES (${id}, ${user.id}, ${sportsbookId}, ${username || null}, ${balance || null}, ${notes || null}, ${now}, ${now})
    `;

    return successResponse({ success: true, id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid input', 400);
    }
    console.error('Create account error:', error);
    return errorResponse('Failed to create account');
  }
}
