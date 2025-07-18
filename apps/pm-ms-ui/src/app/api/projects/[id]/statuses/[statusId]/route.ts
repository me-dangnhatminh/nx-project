import { NextResponse } from 'next/server';
import { UpdateIssueStatusSchema } from 'apps/pm-ms-ui/src/lib/schemas/status';
import { statusDelete, statusUpdate } from 'apps/pm-ms-ui/src/lib/services/status';
import { cookies } from 'next/headers';
import z from 'zod';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; statusId: string }> },
) {
  try {
    const cookie = await cookies();
    const userId = cookie.get('x-user-id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const valid = UpdateIssueStatusSchema.parse(body);
    const { id: projectId, statusId } = await params;

    await statusUpdate(valid, { requesterId: 'system', statusId });
    return NextResponse.json({ message: 'Status updated successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; statusId: string }> },
) {
  try {
    const cookie = await cookies();
    const userId = cookie.get('x-user-id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: projectId, statusId } = await params;

    await statusDelete({}, { requesterId: userId, projectId, statusId });
    return NextResponse.json({ message: 'Status deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
