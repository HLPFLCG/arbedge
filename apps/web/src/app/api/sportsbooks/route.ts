export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db-edge';
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const sql = getDb();

    const sportsbooks = await sql`
      SELECT id, name, slug, logo, website, "isActive", tier
      FROM sportsbooks
      WHERE "isActive" = true
      ORDER BY tier, name
    `;

    return successResponse({ sportsbooks });
  } catch (error) {
    console.error('Get sportsbooks error:', error);
    return errorResponse('Failed to get sportsbooks');
  }
}
