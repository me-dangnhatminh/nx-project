import { NextRequest, NextResponse } from 'next/server';
import { authServices } from 'apps/pm-ms-ui/src/lib/services/auth';

export async function POST(request: NextRequest) {
  try {
    await authServices.removeAuthCookie();
    return NextResponse.json({ message: 'Signed out successfully' }, { status: 200 });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json({ error: 'Failed to sign out. Please try again.' }, { status: 500 });
  }
}
