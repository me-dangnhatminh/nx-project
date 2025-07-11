import { NextRequest, NextResponse } from 'next/server';
import { authServices } from 'apps/pm-ms-ui/src/lib/services/auth';
import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authUser = await authServices.getAuthUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get full user data from database
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
