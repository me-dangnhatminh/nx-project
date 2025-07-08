import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

// Validation schema for creating projects - accept lowercase and convert to uppercase
const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  key: z
    .string()
    .min(1, 'Project key is required')
    .max(20, 'Project key must be less than 20 characters'),
  description: z.string().optional(),
  type: z.enum(['software', 'business', 'service_desk']).transform((val) => {
    // Convert to uppercase for database
    const mapping = {
      software: 'SOFTWARE',
      business: 'BUSINESS',
      service_desk: 'SERVICE_DESK',
    };
    return mapping[val];
  }),
  category: z
    .string()
    .min(1, 'Project category is required')
    .max(50, 'Project category must be less than 50 characters'),
  url: z.string().url('Please enter a valid URL').optional(),
  avatar: z.string().url('Please enter a valid avatar URL').optional(),
});

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};

    if (type && type !== 'all') {
      // Convert lowercase to uppercase for database query
      const typeMapping = {
        software: 'SOFTWARE',
        business: 'BUSINESS',
        service_desk: 'SERVICE_DESK',
      };
      where.type = typeMapping[type] || type.toUpperCase();
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { key: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
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
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    // Transform data to match your interface
    const transformedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      type: project.type.toLowerCase(), // Convert back to lowercase for frontend
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
      // Additional stats
      issueCount: project._count.issues,
      memberCount: project._count.members,
    }));

    return NextResponse.json({
      data: transformedProjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = CreateProjectSchema.parse(body);

    // Get current user ID
    const currentUserId = 'cmctveugu000f0hehpa9g5qho'; //TODO Replace with actual auth

    // Check if user exists
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if project key already exists
    const existingProject = await prisma.project.findUnique({
      where: { key: validatedData.key },
    });

    if (existingProject) {
      return NextResponse.json({ error: 'Project key already exists' }, { status: 409 });
    }

    // Create project with transaction to ensure consistency
    const project = await prisma.$transaction(async (tx) => {
      // Create the project
      const newProject = await tx.project.create({
        data: {
          name: validatedData.name,
          key: validatedData.key,
          description: validatedData.description,
          type: validatedData.type as any, // Already converted by zod transform
          category: validatedData.category,
          url: validatedData.url,
          avatar: validatedData.avatar,
          leadId: currentUserId,
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
        },
      });

      // Add the lead as a project member with ADMIN role
      await tx.projectMember.create({
        data: {
          userId: currentUserId,
          projectId: newProject.id,
          role: 'ADMIN',
        },
      });

      return newProject;
    });

    // Fetch the complete project with members
    const completeProject = await prisma.project.findUnique({
      where: { id: project.id },
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
      id: completeProject!.id,
      name: completeProject!.name,
      key: completeProject!.key,
      description: completeProject!.description,
      type: completeProject!.type.toLowerCase(), // Convert back to lowercase
      lead: {
        id: completeProject!.lead.id,
        name: completeProject!.lead.name,
        email: completeProject!.lead.email,
        avatar: completeProject!.lead.avatar,
        role: completeProject!.lead.role.toLowerCase(),
        department: completeProject!.lead.department,
      },
      category: completeProject!.category,
      url: completeProject!.url,
      avatar: completeProject!.avatar,
      createdAt: completeProject!.createdAt.toISOString(),
      updatedAt: completeProject!.updatedAt.toISOString(),
      status: completeProject!.status.toLowerCase(),
      members: completeProject!.members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatar: member.user.avatar,
        role: member.user.role.toLowerCase(),
        department: member.user.department,
      })),
    };

    return NextResponse.json(transformedProject, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
