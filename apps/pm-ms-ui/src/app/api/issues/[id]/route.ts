import { issueService } from 'apps/pm-ms-ui/src/lib/services/issue';
import { NextRequest, NextResponse } from 'next/server';
import { updateIssueSchema } from '@pm-ms-ui/lib/types/issue';
import { ZodError } from 'zod';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const issue = await issueService.getIssueById(params.id, request);
    return NextResponse.json({ success: true, data: issue });
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      const statusCode = error.message === 'Issue not found' ? 404 : 400;
      return NextResponse.json({ success: false, error: error.message }, { status: statusCode });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const validatedData = updateIssueSchema.parse(body);

    // Pass request to service to get current user from cookie
    const issue = await issueService.updateIssue(params.id, validatedData, request);

    return NextResponse.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    console.error(`PUT /api/issues/${params.id} error:`, error);

    if (error instanceof Error) {
      let statusCode = 400;
      if (error.message === 'Issue not found') statusCode = 404;
      if (error.message.includes('not authenticated')) statusCode = 401;

      return NextResponse.json({ success: false, error: error.message }, { status: statusCode });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const validatedData = updateIssueSchema.parse(body);
    const issue = await issueService.updateIssue(params.id, validatedData, request);

    return NextResponse.json({ success: true, data: issue });
  } catch (error) {
    if (error instanceof ZodError) {
      const errMsg = error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ success: false, error: errMsg }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    let result;
    if (hard) {
      // Pass request to service to get current user from cookie
      result = await issueService.hardDeleteIssue(params.id, request);
    } else {
      // Pass request to service to get current user from cookie
      result = await issueService.deleteIssue(params.id, request);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(`DELETE /api/issues/${params.id} error:`, error);

    if (error instanceof Error) {
      let statusCode = 400;
      if (error.message === 'Issue not found') statusCode = 404;
      if (error.message.includes('not authenticated')) statusCode = 401;

      return NextResponse.json({ success: false, error: error.message }, { status: statusCode });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
