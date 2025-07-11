import { NextRequest, NextResponse } from 'next/server';
import { statusService } from 'apps/pm-ms-ui/src/lib/services/status';
import { z } from 'zod';

const reorderSchema = z.object({
  statusIds: z.array(z.string()).min(1, 'At least one status ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { statusIds } = reorderSchema.parse(body);

    const result = await statusService.reorderStatuses(statusIds, request);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Statuses reordered successfully',
    });
  } catch (error) {
    console.error('POST /api/statuses/reorder error:', error);

    if (error instanceof Error) {
      const statusCode = error.message.includes('not authenticated') ? 401 : 400;
      return NextResponse.json({ success: false, error: error.message }, { status: statusCode });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
