import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { z } from 'zod';
import { User } from 'apps/pm-ms-ui/src/lib/types';

const AddMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

// GET /api/projects/[id]/members - Get project members
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const projectId = await params.then((p) => p.id);
    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, permissionSchemaId: true },
    });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const roleActors = await prisma.projectRoleActor.findMany({
      where: { projectId, roleType: 'USER' },
    });
    const userIds = roleActors.map((actor) => actor.roleParam);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, email: true, avatar: true },
    });

    const result = { items: users, total: users.length };
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching project members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects/[id]/members - Add member to project
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  throw new Error('This endpoint is not implemented yet');
  // try {
  //   const body = await request.json();
  //   const validatedData = AddMemberSchema.parse(body);

  //   // Check if project exists
  //   const project = await prisma.project.findUnique({
  //     where: { id: params.id },
  //   });

  //   if (!project) {
  //     return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  //   }

  //   // Check if user exists
  //   const user = await prisma.user.findUnique({
  //     where: { id: validatedData.userId },
  //   });

  //   if (!user) {
  //     return NextResponse.json({ error: 'User not found' }, { status: 404 });
  //   }

  //   // Check if user is already a member
  //   const existingMember = await prisma.projectMember.findUnique({
  //     where: {
  //       userId_projectId: {
  //         userId: validatedData.userId,
  //         projectId: params.id,
  //       },
  //     },
  //   });

  //   if (existingMember) {
  //     return NextResponse.json(
  //       { error: 'User is already a member of this project' },
  //       { status: 409 },
  //     );
  //   }

  //   const member = await prisma.projectMember.create({
  //     data: {
  //       userId: validatedData.userId,
  //       projectId: params.id,
  //       role: validatedData.role,
  //     },
  //     include: {
  //       user: {
  //         select: {
  //           id: true,
  //           name: true,
  //           email: true,
  //           avatar: true,
  //           role: true,
  //           department: true,
  //         },
  //       },
  //     },
  //   });

  //   const transformedMember = {
  //     id: member.id,
  //     user: {
  //       id: member.user.id,
  //       name: member.user.name,
  //       email: member.user.email,
  //       avatar: member.user.avatar,
  //       role: member.user.role.toLowerCase(),
  //       department: member.user.department,
  //     },
  //     role: member.role.toLowerCase(),
  //     joinedAt: member.joinedAt.toISOString(),
  //   };

  //   return NextResponse.json(transformedMember, { status: 201 });
  // } catch (error) {
  //   if (error instanceof z.ZodError) {
  //     return NextResponse.json(
  //       { error: 'Validation error', details: error.errors },
  //       { status: 400 },
  //     );
  //   }

  //   console.error('Error adding project member:', error);
  //   return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  // }
}
