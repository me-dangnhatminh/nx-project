import { NextRequest, NextResponse } from 'next/server';
import { statusService } from '@pm-ms-ui/lib/services/status';
import { updateStatusSchema } from 'apps/pm-ms-ui/src/lib/types/status';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const status = await statusService.getStatusById(params.id);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error(`GET /api/statuses/${params.id} error:`, error);

    if (error instanceof Error) {
      const statusCode = error.message === 'Status not found' ? 404 : 400;
      return NextResponse.json({ success: false, error: error.message }, { status: statusCode });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    const status = await statusService.updateStatus(params.id, validatedData, request);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error(`PUT /api/statuses/${params.id} error:`, error);

    if (error instanceof Error) {
      let statusCode = 400;
      if (error.message === 'Status not found') statusCode = 404;
      if (error.message.includes('not authenticated')) statusCode = 401;

      return NextResponse.json({ success: false, error: error.message }, { status: statusCode });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const result = await statusService.deleteStatus(params.id, request);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(`DELETE /api/statuses/${params.id} error:`, error);

    if (error instanceof Error) {
      let statusCode = 400;
      if (error.message === 'Status not found') statusCode = 404;
      if (error.message.includes('not authenticated')) statusCode = 401;
      if (error.message.includes('Cannot delete status')) statusCode = 409; // Conflict

      return NextResponse.json({ success: false, error: error.message }, { status: statusCode });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
