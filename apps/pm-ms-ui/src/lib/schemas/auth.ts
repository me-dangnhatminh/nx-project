import z from 'zod';

export const SignInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const PasswordSchema = z.string().min(6, 'Password must be at least 6 characters long');
export const FirstNameSchema = z.string().min(1, 'First name is required');
export const LastNameSchema = z.string().min(1, 'Last name is required');
export const SignUpSchema = z
  .object({
    firstName: FirstNameSchema,
    lastName: LastNameSchema,
    email: z.string().email('Invalid email format'),
    password: PasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
