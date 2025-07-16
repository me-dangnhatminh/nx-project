import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    cookieStore.delete('x-user-id');
    return NextResponse.json({ message: 'Signed out successfully' }, { status: 200 });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json({ error: 'Failed to sign out. Please try again.' }, { status: 500 });
  }
}
