import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import z from 'zod';
import { SignInSchema } from 'apps/pm-ms-ui/src/lib/schemas/auth';
import { AUTH_ERRORS, authSignin } from 'apps/pm-ms-ui/src/lib/services/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const valid = SignInSchema.parse(body);

    const signed = await authSignin(valid);
    const { token } = signed;

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ message: 'Sign in successful' }, { status: 200 });
  } catch (error) {
    console.error('Sign in error:', error);
    if (error instanceof z.ZodError) {
      const issues = error.flatten().fieldErrors;
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    if (error instanceof Error) {
      const errorMessage = error.message;
      if (errorMessage === AUTH_ERRORS.EMAIL_ALREADY_EXISTS) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
      if (errorMessage === AUTH_ERRORS.USER_NOT_FOUND) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      if (errorMessage === AUTH_ERRORS.INVALID_PASSWORD) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
