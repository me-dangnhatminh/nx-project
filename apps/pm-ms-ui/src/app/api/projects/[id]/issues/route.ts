import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { gIssueList, issueCreate } from 'apps/pm-ms-ui/src/lib/services/issue';
import { CreateIssueSchema } from 'apps/pm-ms-ui/src/lib/schemas/issue';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookie = await cookies();
    const userId = cookie.get('x-user-id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    const { id: projectId } = await params;
    const query = request.nextUrl.searchParams;
    const statusId = query.get('statusId') ? String(query.get('statusId')) : undefined;

    const resData = await gIssueList({ projectId, statusId });
    return NextResponse.json({ data: resData });
  } catch (error) {
    console.error('GET /api/issues error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookie = await cookies();
    const userId = cookie.get('x-user-id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

    const body = await request.json();
    const valid = CreateIssueSchema.parse(body);

    await issueCreate({ issue: valid }, { requesterId: userId });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('POST /api/issues error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
