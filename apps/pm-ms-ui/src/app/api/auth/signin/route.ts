import { NextRequest, NextResponse } from 'next/server';
import { SignInSchema } from '@shared/types/pmms';
import { userServices } from 'apps/pm-ms-ui/src/lib/services/user';
import { authServices } from 'apps/pm-ms-ui/src/lib/services/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = SignInSchema.safeParse(body);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json({ error: 'Invalid input', details: issues }, { status: 400 });
    }

    const { email, password } = result.data;

    // Find user
    const user = await userServices.findUserWithCredential('email', email.toLowerCase());
    if (!user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });

    // Verify password
    const isValidPassword = await authServices.verifyPassword(password, user.credential);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Set auth cookie
    await authServices.setAuthCookie({
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.id,
      email: user.email,
    });

    const { credential, ...userData } = user;

    return NextResponse.json({ message: 'Sign in successful', data: userData });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
