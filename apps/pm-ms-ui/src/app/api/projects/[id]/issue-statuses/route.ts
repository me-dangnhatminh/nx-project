import { prisma } from 'apps/pm-ms-ui/src/lib/prisma';
import { NextResponse } from 'next/server';

type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, { params }: Context) {
  try {
    const { id: projectId } = await params;
    const statuses = await prisma.issueStatus.findMany({
      where: { projectId },
      orderBy: { sequence: 'asc' },
    });
    const result = { items: statuses, total: statuses.length };
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching project issues:', error);
    return NextResponse.json({ error: 'Failed to fetch project issues' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const { id: projectId } = await params;
    const input = await request.json();
    const newStatus = await prisma.issueStatus.create({
      data: { ...input, projectId },
    });
    return NextResponse.json(newStatus, { status: 201 });
  } catch (error) {
    console.error('Error creating issue status:', error);
    return NextResponse.json({ error: 'Failed to create issue status' }, { status: 500 });
  }
}
