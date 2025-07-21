import { SignInInput, SignUpInput } from 'apps/pm-ms-ui/src/lib/schemas/auth';
import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import { hash, compare } from 'bcryptjs';
import { generateToken } from './auth-token';

export const AUTH_ERRORS = {
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_PASSWORD: 'Invalid password',
} as const;

export const authSignup = async (input: SignUpInput) => {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) throw new Error(AUTH_ERRORS.EMAIL_ALREADY_EXISTS);

  const hashedPassword = await hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      credential: hashedPassword,
    },
  });

  const token = await generateToken({
    id: user.id,
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  return { user, token };
};

export const authSignin = async (input: SignInInput) => {
  const { email, password } = input;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(AUTH_ERRORS.USER_NOT_FOUND);
  const isPasswordValid = await compare(password, user.credential);
  if (!isPasswordValid) throw new Error(AUTH_ERRORS.INVALID_PASSWORD);
  const token = await generateToken({
    id: user.id,
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });
  return { user, token };
};
