import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import { NextResponse } from 'next/server';

type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, { params }: Context) {
  try {
    const { id: projectId } = await params;
    const issueTypes = await prisma.issueType.findMany({ where: { projectId } });
    const result = { items: issueTypes, total: issueTypes.length };
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching project issues:', error);
    return NextResponse.json({ error: 'Failed to fetch project issues' }, { status: 500 });
  }
}
