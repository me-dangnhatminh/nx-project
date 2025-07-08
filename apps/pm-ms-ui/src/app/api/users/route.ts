import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// gen user
prisma.user
  .createMany({
    data: [
      { name: 'Alice', acountId: 'alice123' },
      { name: 'Bob', acountId: 'bob123' },
      { name: 'Charlie', acountId: 'charlie123' },
    ],
    skipDuplicates: true,
  })
  .then(() => {
    console.log('Users created successfully');
  })
  .catch((error) => {
    console.error('Error creating users:', error);
  });

export async function GET(request: Request) {
  try {
    const user = await prisma.user.findMany({});

    const resData = JSON.stringify({
      message: 'Users fetched successfully',
      data: user,
    });

    return new Response(resData, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
