import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';
import { projectInvite } from 'apps/pm-ms-ui/src/lib/services/project';
import { InviteUserSchema } from 'apps/pm-ms-ui/src/lib/schemas/project';

type Params = Promise<{ id: string }>;
type Context = { params: Params };

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params;

    const userId = request.cookies.get('x-user-id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const valid = InviteUserSchema.parse({ projectId, inviteeId: body.inviteeId });

    await projectInvite({ ...valid, requesterId: userId });

    return NextResponse.json({ message: 'User invited successfully' }, { status: 200 });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 });
  }
}
