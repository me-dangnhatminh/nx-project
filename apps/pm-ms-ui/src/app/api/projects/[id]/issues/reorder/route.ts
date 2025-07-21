import z from 'zod';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { issueReorder } from 'apps/pm-ms-ui/src/lib/services/issue';
import { ReorderIssueSchema } from 'apps/pm-ms-ui/src/lib/schemas/issue';
import { getAuthContext } from 'apps/pm-ms-ui/src/lib/utils/auth';

type Context = { params: Promise<{ id: string }> };
export async function POST(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params;
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = auth.user.id;
    const body = await request.json();
    const valid = ReorderIssueSchema.parse(body);
    const result = await issueReorder(valid, { requesterId: userId, projectId });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in issue reorder:', error);
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => err.message).join(', ');
      return NextResponse.json({ error: errorMessages }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
