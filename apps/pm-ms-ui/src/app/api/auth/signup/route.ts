import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import z from 'zod';
import { SignUpSchema } from 'apps/pm-ms-ui/src/lib/schemas/auth';
import { AUTH_ERRORS, authSignup } from 'apps/pm-ms-ui/src/lib/services/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const valid = SignUpSchema.parse(body);
    const signedUp = await authSignup(valid);
    const { token } = signedUp;
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return NextResponse.json({ message: 'Sign up successful' }, { status: 201 });
  } catch (error) {
    console.error('Sign up error:', error);
    if (error instanceof z.ZodError) {
      const issues = error.flatten().fieldErrors;
      return NextResponse.json({ error: issues }, { status: 400 });
    }

    if (error instanceof Error) {
      const errorMessage = error.message;
      if (errorMessage === AUTH_ERRORS.EMAIL_ALREADY_EXISTS) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
