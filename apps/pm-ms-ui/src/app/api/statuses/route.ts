import { NextRequest, NextResponse } from 'next/server';
import { statusService } from 'apps/pm-ms-ui/src/lib/services/statusService';
import { createStatusSchema } from 'apps/pm-ms-ui/src/lib/types/status';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = {
      page: (() => {
        const pageParam = searchParams.get('page');
        const parsed = pageParam ? parseInt(pageParam, 10) : 1;
        return isNaN(parsed) ? 1 : Math.max(1, parsed);
      })(),
      limit: (() => {
        const limitParam = searchParams.get('limit');
        const parsed = limitParam ? parseInt(limitParam, 10) : 50;
        return isNaN(parsed) ? 50 : Math.min(Math.max(1, parsed), 100);
      })(),
    };

    const result = await statusService.getStatuses(query);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('GET /api/statuses error:', error);

    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createStatusSchema.parse(body);

    const status = await statusService.createStatus(validatedData, request);

    return NextResponse.json(
      {
        success: true,
        data: status,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST /api/statuses error:', error);

    if (error instanceof Error) {
      const statusCode = error.message.includes('not authenticated') ? 401 : 400;
      return NextResponse.json({ success: false, error: error.message }, { status: statusCode });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
