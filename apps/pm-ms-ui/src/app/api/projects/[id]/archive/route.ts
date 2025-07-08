import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// POST /api/projects/[id]/archive - Archive project
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Archive project
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date(),
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            department: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                department: true,
              },
            },
          },
        },
      },
    });

    // Transform response
    const transformedProject = {
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      type: project.type.toLowerCase(),
      lead: {
        id: project.lead.id,
        name: project.lead.name,
        email: project.lead.email,
        avatar: project.lead.avatar,
        role: project.lead.role.toLowerCase(),
        department: project.lead.department,
      },
      category: project.category,
      url: project.url,
      avatar: project.avatar,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      status: project.status.toLowerCase(),
      members: project.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.avatar,
        role: member.user.role.toLowerCase(),
        department: member.user.department,
      })),
    };

    return NextResponse.json(transformedProject);
  } catch (error) {
    console.error('Error archiving project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/archive - Unarchive project
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Unarchive project
    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            department: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
                department: true,
              },
            },
          },
        },
      },
    });

    // Transform response
    const transformedProject = {
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      type: project.type.toLowerCase(),
      lead: {
        id: project.lead.id,
        name: project.lead.name,
        email: project.lead.email,
        avatar: project.lead.avatar,
        role: project.lead.role.toLowerCase(),
        department: project.lead.department,
      },
      category: project.category,
      url: project.url,
      avatar: project.avatar,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      status: project.status.toLowerCase(),
      members: project.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.avatar,
        role: member.user.role.toLowerCase(),
        department: member.user.department,
      })),
    };

    return NextResponse.json(transformedProject);
  } catch (error) {
    console.error('Error unarchiving project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
