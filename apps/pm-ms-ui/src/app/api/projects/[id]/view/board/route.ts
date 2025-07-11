import { NextRequest, NextResponse } from 'next/server';
import { issueService } from 'apps/pm-ms-ui/src/lib/services/issue';
import z, { ZodError } from 'zod';

const RouteParamsSchema = z.object({ params: z.object({ id: z.string() }) });
type RouteParams = z.infer<typeof RouteParamsSchema>;

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const result = await issueService.getProjectData(params.id, request);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof ZodError) {
      const errMsg = error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ success: false, error: errMsg }, { status: 400 });
    }

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
