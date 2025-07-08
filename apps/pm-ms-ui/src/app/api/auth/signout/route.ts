import { removeAuthCookie } from '../../../../lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Remove auth cookie
    await removeAuthCookie();
    return NextResponse.json({ message: 'Signed out successfully' }, { status: 200 });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json({ error: 'Failed to sign out. Please try again.' }, { status: 500 });
  }
}
