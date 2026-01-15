export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db-edge';
import { getAuthenticatedUser, unauthorizedResponse, errorResponse, successResponse } from '@/lib/api-utils';
import { z } from 'zod';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const sql = getDb();

    const alerts = await sql`
      SELECT * FROM alert_configs
      WHERE id = ${id} AND "userId" = ${user.id}
    `;

    if (alerts.length === 0) {
      return errorResponse('Alert not found', 404);
    }

    return successResponse({ alert: alerts[0] });
  } catch (error) {
    console.error('Get alert error:', error);
    return errorResponse('Failed to get alert');
  }
}

const updateAlertSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
  channels: z.array(z.enum(['WEBSOCKET', 'DISCORD', 'TELEGRAM', 'EMAIL'])).optional(),
  minProfit: z.number().min(0).nullable().optional(),
  maxProfit: z.number().min(0).nullable().optional(),
  minConfidence: z.number().min(0).max(100).nullable().optional(),
  sports: z.array(z.string()).optional(),
  sportsbooks: z.array(z.string()).optional(),
  marketTypes: z.array(z.enum(['MONEYLINE', 'SPREAD', 'TOTAL', 'PROP', 'FUTURES'])).optional(),
  discordWebhook: z.string().url().nullable().optional(),
  telegramChatId: z.string().nullable().optional(),
});

export async function PATCH(req: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = updateAlertSchema.parse(body);

    const sql = getDb();
    const now = new Date().toISOString();

    // Verify ownership
    const existing = await sql`
      SELECT id FROM alert_configs WHERE id = ${id} AND "userId" = ${user.id}
    `;

    if (existing.length === 0) {
      return errorResponse('Alert not found', 404);
    }

    // Build dynamic update - for simplicity, update all provided fields
    await sql`
      UPDATE alert_configs
      SET
        name = COALESCE(${data.name ?? null}, name),
        "isActive" = COALESCE(${data.isActive ?? null}, "isActive"),
        channels = COALESCE(${data.channels ?? null}, channels),
        "minProfit" = COALESCE(${data.minProfit}, "minProfit"),
        "maxProfit" = COALESCE(${data.maxProfit}, "maxProfit"),
        "minConfidence" = COALESCE(${data.minConfidence}, "minConfidence"),
        sports = COALESCE(${data.sports ?? null}, sports),
        sportsbooks = COALESCE(${data.sportsbooks ?? null}, sportsbooks),
        "marketTypes" = COALESCE(${data.marketTypes ?? null}, "marketTypes"),
        "discordWebhook" = COALESCE(${data.discordWebhook}, "discordWebhook"),
        "telegramChatId" = COALESCE(${data.telegramChatId}, "telegramChatId"),
        "updatedAt" = ${now}
      WHERE id = ${id} AND "userId" = ${user.id}
    `;

    return successResponse({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid input', 400);
    }
    console.error('Update alert error:', error);
    return errorResponse('Failed to update alert');
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const user = await getAuthenticatedUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const { id } = await context.params;
    const sql = getDb();

    const result = await sql`
      DELETE FROM alert_configs
      WHERE id = ${id} AND "userId" = ${user.id}
      RETURNING id
    `;

    if (result.length === 0) {
      return errorResponse('Alert not found', 404);
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error('Delete alert error:', error);
    return errorResponse('Failed to delete alert');
  }
}
