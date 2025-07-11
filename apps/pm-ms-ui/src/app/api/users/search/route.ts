import { NextRequest } from 'next/server';
import { userServices } from 'apps/pm-ms-ui/src/lib/services/user';

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || '';

  if (!text) {
    return new Response(JSON.stringify({ items: [], total: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const result = await userServices.searchUser(text);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    const errorMessage = error.message || 'An error occurred while searching for users';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
