import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import z from 'zod';
import { qStatusList, statusCreate } from 'apps/pm-ms-ui/src/lib/services/status';
import { CreateStatusSchema } from 'apps/pm-ms-ui/src/lib/schemas/issue-status';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: Context) {
  try {
    const cookie = await cookies();
    const userId = cookie.get('x-user-id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const { id: projectId } = await context.params;
    if (!projectId) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });

    const result = await qStatusList({ projectId });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET /api/statuses error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: Context) {
  try {
    const cookie = await cookies();
    const userId = cookie.get('x-user-id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    const { id: projectId } = await context.params;

    const body = await req.json();
    const valid = CreateStatusSchema.parse(body);
    await statusCreate(valid, { userId, projectId });
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const msg = error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  try {
    const cookie = await cookies();
    const userId = cookie.get('x-user-id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const { id: projectId } = await context.params;
    if (!projectId) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });

    // Logic for deleting a status would go here
    // For example, you might call a service to delete the status by ID

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/statuses error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: Context) {
  try {
    const cookie = await cookies();
    const userId = cookie.get('x-user-id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const { id: projectId } = await context.params;
    if (!projectId) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/statuses error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
