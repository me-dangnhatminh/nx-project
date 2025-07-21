import z from 'zod';
import { NextResponse } from 'next/server';
import { getAuthContext } from 'apps/pm-ms-ui/src/lib/utils/auth';
import { getUserProjectPermissions } from 'apps/pm-ms-ui/src/lib/services/permission';

type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, { params }: Context) {
  try {
    const { id: userId } = await params;
    const authContext = await getAuthContext();
    if (!authContext) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (authContext.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const result = await getUserProjectPermissions(userId, projectId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching auth context:', error);
    if (error instanceof z.ZodError) {
      const msg = error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: `Invalid parameters: ${msg}` }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
