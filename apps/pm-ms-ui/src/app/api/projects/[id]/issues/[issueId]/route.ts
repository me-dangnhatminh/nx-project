import { issueDelete } from 'apps/pm-ms-ui/src/lib/services/issue';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

type Params = Promise<{ id: string; issueId: string }>;
type Context = { params: Params };
export async function GET(request: NextRequest, { params }: { params: Params }) {
  throw new Error('GET method is not implemented for this route');
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
  throw new Error('PUT method is not implemented for this route');
}

export async function PATCH(request: NextRequest, { params }: Context) {
  throw new Error('PATCH method is not implemented for this route');
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId, issueId } = await params;

    await issueDelete({ projectId, issueId });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
