import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';

export default async function qUser(userId: string, params: { type: 'project' }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
    },
  });
  if (!user) throw new Error(`User with id ${userId} not found`);

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    displayName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    avatar: user.avatar,
  };
}
