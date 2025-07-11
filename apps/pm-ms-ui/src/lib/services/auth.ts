import { compare, hash } from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '../prisma';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key');
const JWT_EXPIRES_IN = '7d';

export type JWTPayload = {
  firstName?: string;
  lastName?: string;
  userId: string;
  email: string;
};

async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

async function generateToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    // return verify(token, JWT_SECRET) as JWTPayload;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

async function setAuthCookie(user: JWTPayload) {
  const token = await generateToken(user);
  const cookieStore = await cookies();

  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

async function getAuthUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

async function requireAuth(): Promise<JWTPayload> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export const authServices = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  setAuthCookie,
  removeAuthCookie,
  getAuthUser,
  requireAuth,
};
