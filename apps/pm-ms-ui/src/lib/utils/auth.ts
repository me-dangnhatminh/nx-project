import { cookies } from 'next/headers';
import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import { JWTPayload, verifyToken } from 'apps/pm-ms-ui/src/lib/services/auth/auth-token';

export interface AuthContext {
  user: JWTPayload;
  requestId: string;
  timestamp: string;
}

export async function getAuthContext(): Promise<AuthContext | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return null;
    const payload = await verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!user) return null;

    return {
      user: {
        id: user.id,
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Auth context error:', error);
    return null;
  }
}
