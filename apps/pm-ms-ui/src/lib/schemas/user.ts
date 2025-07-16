import z from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email('Invalid email format'),
  picture: z.any().optional(),
});
