// Centralized authentication configuration for Edge Runtime

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is required. ' +
      'Please set it in your environment or Cloudflare Pages dashboard.'
    );
  }

  if (secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security.'
    );
  }

  return secret;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export const AUTH_COOKIE_NAME = 'auth-token';

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export const JWT_EXPIRY_DAYS = 30;
