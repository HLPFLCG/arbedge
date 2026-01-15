import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/shared/sidebar';
import { Header } from '@/components/shared/header';
import { verifyToken } from '@/lib/auth-edge';
import { AUTH_COOKIE_NAME } from '@/lib/auth-config';

// JWT secret check - we can't use getJwtSecret() here as it throws,
// so we do a safe decode if secret is not available
async function getValidatedPayload(token: string): Promise<Record<string, any> | null> {
  try {
    const secret = process.env.JWT_SECRET;

    // If no secret configured, fall back to decode-only (development mode)
    if (!secret) {
      console.warn('JWT_SECRET not configured - falling back to decode-only mode');
      const [, encodedPayload] = token.split('.');
      if (!encodedPayload) return null;
      const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      return payload;
    }

    // Verify token signature
    return await verifyToken(token, secret);
  } catch {
    return null;
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await getValidatedPayload(token);

  if (!payload) {
    redirect('/login');
  }

  const user = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    image: payload.image,
    subscriptionTier: payload.subscriptionTier || 'FREE',
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
