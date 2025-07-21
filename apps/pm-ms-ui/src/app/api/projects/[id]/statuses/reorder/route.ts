import { NextRequest, NextResponse } from 'next/server';
import { statusReorder } from 'apps/pm-ms-ui/src/lib/services/status';
import { cookies } from 'next/headers';
import { ReorderStatusSchema } from 'apps/pm-ms-ui/src/lib/schemas/issue-status';
import z from 'zod';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const cookie = await cookies();
    const userId = cookie.get('x-user-id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const { id: projectId } = await context.params;
    if (!projectId) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    const body = await request.json();
    const valid = ReorderStatusSchema.parse(body);

    await statusReorder(valid, { userId, projectId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/statuses/reorder error:', error);
    if (error instanceof z.ZodError) {
      const msg = error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
