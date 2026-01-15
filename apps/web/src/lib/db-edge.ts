// Edge-compatible database client using Neon serverless driver
import { neon } from '@neondatabase/serverless';

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  return neon(databaseUrl);
}

// Helper to generate CUID-like IDs
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.getRandomValues(new Uint8Array(8));
  const randomStr = Array.from(randomPart).map(b => b.toString(36)).join('').slice(0, 8);
  return `c${timestamp}${randomStr}`;
}
