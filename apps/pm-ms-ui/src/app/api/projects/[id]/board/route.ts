import { NextRequest, NextResponse } from 'next/server';
import { issueService } from 'apps/pm-ms-ui/src/lib/services/issue';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const result = await issueService.getProjectData(params.id, request);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(`GET /api/projects/${params.id}/board error:`, error);

    if (error instanceof Error) {
      const statusCode = error.message === 'Project not found' ? 404 : 400;
      return NextResponse.json({ success: false, error: error.message }, { status: statusCode });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
