import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';

// Validation schema for updating projects
const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  key: z.string().min(1).max(20).optional(),
  description: z.string().optional(),
  type: z
    .enum(['software', 'business', 'service_desk'])
    .transform((val) => {
      const mapping = {
        software: 'SOFTWARE',
        business: 'BUSINESS',
        service_desk: 'SERVICE_DESK',
      };
      return mapping[val];
    })
    .optional(),
  category: z.string().min(1).max(50).optional(),
  url: z.string().url().optional(),
  avatar: z.string().url().optional(),
  status: z
    .enum(['active', 'archived'])
    .transform((val) => val.toUpperCase())
    .optional(),
});

// GET /api/projects/[id] - Get project by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
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
        _count: {
          select: {
            issues: true,
            members: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Transform data
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
      issueCount: project._count.issues,
      memberCount: project._count.members,
    };

    return NextResponse.json(transformedProject);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = UpdateProjectSchema.parse(body);

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if key is unique (if updating key)
    if (validatedData.key && validatedData.key !== existingProject.key) {
      const keyExists = await prisma.project.findUnique({
        where: { key: validatedData.key },
      });

      if (keyExists) {
        return NextResponse.json({ error: 'Project key already exists' }, { status: 409 });
      }
    }

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...validatedData,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            issues: true,
            members: true,
            sprints: true,
          },
        },
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if project has associated data
    const hasData = existingProject._count.issues > 0 || 
                   existingProject._count.members > 1 || // More than just the lead
                   existingProject._count.sprints > 0;

    if (hasData) {
      return NextResponse.json(
        { 
          error: 'Cannot delete project with associated data',
          details: {
            issues: existingProject._count.issues,
            members: existingProject._count.members,
            sprints: existingProject._count.sprints,
          }
        },
        { status: 409 }
      );
    }

    // Delete project using transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete project members first
      await tx.projectMember.deleteMany({
        where: { projectId: params.id },
      });

      // Delete the project
      await tx.project.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ 
      message: 'Project deleted successfully',
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}