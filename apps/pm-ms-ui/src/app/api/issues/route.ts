import { NextRequest, NextResponse } from 'next/server';
import { issueService } from 'apps/pm-ms-ui/src/lib/services/issue';
import { createIssueSchema } from 'apps/pm-ms-ui/src/lib/types/issue';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Manual parsing to handle type conversion properly
    const query = {
      projectId: searchParams.get('projectId') || undefined,
      assigneeId: searchParams.get('assigneeId') || undefined,
      reporterId: searchParams.get('reporterId') || undefined,
      statusId: searchParams.get('statusId') || undefined,
      typeId: searchParams.get('typeId') || undefined,
      priorityId: searchParams.get('priorityId') || undefined,
      archived: (() => {
        const archivedParam = searchParams.get('archived');
        if (archivedParam === null || archivedParam === '') return undefined;
        return archivedParam === 'true' || archivedParam === '1';
      })(),
      page: (() => {
        const pageParam = searchParams.get('page');
        const parsed = pageParam ? parseInt(pageParam, 10) : 1;
        return isNaN(parsed) ? 1 : Math.max(1, parsed);
      })(),
      limit: (() => {
        const limitParam = searchParams.get('limit');
        const parsed = limitParam ? parseInt(limitParam, 10) : 20;
        return isNaN(parsed) ? 20 : Math.min(Math.max(1, parsed), 100);
      })(),
      search: searchParams.get('search') || undefined,
    };

    // Remove undefined values
    const cleanQuery = Object.fromEntries(
      Object.entries(query).filter(([_, value]) => value !== undefined),
    );

    // Pass request to service to get current user from cookie
    const result = await issueService.getIssues(cleanQuery, request);

    return NextResponse.json({
      success: true,
      data: result,
    });
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
    const body = await request.json();
    const validatedData = createIssueSchema.parse(body);

    // Pass request to service to get current user from cookie
    const issue = await issueService.createIssue(validatedData, request);

    return NextResponse.json(
      {
        success: true,
        data: issue,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST /api/issues error:', error);

    if (error instanceof Error) {
      const statusCode = error.message.includes('not authenticated') ? 401 : 400;
      return NextResponse.json({ success: false, error: error.message }, { status: statusCode });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
