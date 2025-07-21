import { NextRequest, NextResponse } from 'next/server';
import { projectCreate, projectList } from 'apps/pm-ms-ui/src/lib/services/project';
import { CreateProjectSchema } from 'apps/pm-ms-ui/src/lib/schemas/project';
import z from 'zod';

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get('x-user-id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());
    const valid = CreateProjectSchema.parse(body);
    const result = await projectCreate(valid);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      const errMsg = error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('x-user-id')?.value;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await projectList({ requesterId: userId });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
