import z from 'zod';
import { NextResponse } from 'next/server';
import { qUser } from 'apps/pm-ms-ui/src/lib/services/user';

type Context = { params: Promise<{ id: string }> };
export async function GET(req: Request, { params }: Context) {
  const { id } = await params;
  const user = await qUser(id, { type: 'project' });
  return NextResponse.json(user);
}
