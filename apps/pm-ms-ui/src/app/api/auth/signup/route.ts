import { SignUpSchema } from '@shared/types/pmms';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@pm-ms-ui/lib/prisma';
import { userServices } from '@pm-ms-ui/lib/services/user';
import { authServices } from '@pm-ms-ui/lib/services/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = SignUpSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    // Check if user already exists
    const existingUser = await userServices.findUser('email', email.toLowerCase());

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await authServices.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        email: email.toLowerCase(),
        credential: hashedPassword,
      },
      select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
    });

    // Set auth cookie
    await authServices.setAuthCookie({
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json(
      { message: 'Account created successfully', data: user },
      { status: 201 },
    );
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
