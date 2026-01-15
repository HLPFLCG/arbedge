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

    // Get alert configs
    const alerts = await sql`
      SELECT
        id, name, "isActive", channels, "minProfit", "maxProfit",
        "minConfidence", sports, sportsbooks, "marketTypes",
        "discordWebhook", "telegramChatId", "createdAt", "updatedAt"
      FROM alert_configs
      WHERE "userId" = ${user.id}
      ORDER BY "createdAt" DESC
    `;

    // Get recent alert logs
    const logs = await sql`
      SELECT
        al.id, al.channel, al."sentAt", al.delivered, al.error,
        a."profitPercent" as profit, a.confidence,
        e."homeTeam" || ' @ ' || e."awayTeam" as event
      FROM alert_logs al
      JOIN arbitrages a ON a.id = al."arbitrageId"
      JOIN events e ON e.id = a."eventId"
      JOIN alert_configs ac ON ac."userId" = ${user.id}
      ORDER BY al."sentAt" DESC
      LIMIT 20
    `;

    return successResponse({
      alerts,
      recentLogs: logs,
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    return errorResponse('Failed to get alerts');
  }
}

const createAlertSchema = z.object({
  name: z.string().min(1).max(100),
  channels: z.array(z.enum(['WEBSOCKET', 'DISCORD', 'TELEGRAM', 'EMAIL'])),
  minProfit: z.number().min(0).optional(),
  maxProfit: z.number().min(0).optional(),
  minConfidence: z.number().min(0).max(100).optional(),
  sports: z.array(z.string()).optional(),
  sportsbooks: z.array(z.string()).optional(),
  marketTypes: z.array(z.enum(['MONEYLINE', 'SPREAD', 'TOTAL', 'PROP', 'FUTURES'])).optional(),
  discordWebhook: z.string().url().optional(),
  telegramChatId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return unauthorizedResponse();

  try {
    const body = await req.json();
    const data = createAlertSchema.parse(body);

    const sql = getDb();

    const id = generateId();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO alert_configs (
        id, "userId", name, "isActive", channels, "minProfit", "maxProfit",
        "minConfidence", sports, sportsbooks, "marketTypes",
        "discordWebhook", "telegramChatId", "createdAt", "updatedAt"
      )
      VALUES (
        ${id}, ${user.id}, ${data.name}, true, ${data.channels},
        ${data.minProfit || null}, ${data.maxProfit || null},
        ${data.minConfidence || null}, ${data.sports || []}, ${data.sportsbooks || []},
        ${data.marketTypes || []}, ${data.discordWebhook || null},
        ${data.telegramChatId || null}, ${now}, ${now}
      )
    `;

    return successResponse({ success: true, id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid input', 400);
    }
    console.error('Create alert error:', error);
    return errorResponse('Failed to create alert');
  }
}
