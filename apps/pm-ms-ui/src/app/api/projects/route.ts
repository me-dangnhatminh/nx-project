// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { projectServices } from '@pm-ms-ui/lib/services/project';
import { authServices } from '@pm-ms-ui/lib/services/auth';
import { ProjectCreateSchema } from 'apps/pm-ms-ui/src/lib/api/v2.project';

const authenticateUser = async (request: NextRequest) => {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const verifiedUser = await authServices.verifyToken(token);
  if (!verifiedUser) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
};

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  const userId = request.cookies.get('x-user-id')?.value;
  if (!userId) return NextResponse.json({ error: 'User ID not found' }, { status: 400 });

  const formData = await request.formData();
  const body = ProjectCreateSchema.parse(Object.fromEntries(formData.entries()));

  const project = await projectServices.createProject(body);
  return NextResponse.json(project);
}

// GET /api/projects - List projects
export async function GET(request: NextRequest) {
  const userId = request.cookies.get('x-user-id')?.value;
  if (!userId) return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
  const data = await projectServices.listProjects({ requesterId: userId });
  return NextResponse.json(data);
}
