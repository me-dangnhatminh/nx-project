import { prisma } from '../../prisma';

const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
  });

  if (!user) throw new Error('User not found');
  return user;
};

const getUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
  });

  if (!user) throw new Error('User not found');
  return user;
};

const findUser = async (by: 'id' | 'email', identifier: string) => {
  const user = await prisma.user.findFirst({
    where: { [by]: by === 'id' ? identifier : identifier.toLowerCase() },
    select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
  });

  if (!user) return null;
  return user;
};

const findUserWithCredential = async (by: 'id' | 'email', identifier: string) => {
  const user = await prisma.user.findFirst({
    where: { [by]: by === 'id' ? identifier : identifier.toLowerCase() },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      credential: true,
    },
  });

  if (!user) return null;
  return user;
};

const searchUser = async (text: string) => {
  const users = await prisma.user.findMany({
    where: { OR: [{ email: { contains: text, mode: 'insensitive' } }] },
  });

  return { items: users, total: users.length };
};

export const userServices = {
  getUserById,
  getUserByEmail,
  findUser,
  findUserWithCredential,
  searchUser,
};
