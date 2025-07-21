import { NextRequest, NextResponse } from 'next/server';
import { getProjectMembers } from 'apps/pm-ms-ui/src/lib/services/member';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const projectId = await params.then((p) => p.id);
    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    const result = await getProjectMembers(projectId);
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

// import { NextRequest, NextResponse } from 'next/server';
// import { getProjectMembers } from 'apps/pm-ms-ui/src/lib/services/member';
// import { checkAuthorization, AuthorizationError } from 'apps/pm-ms-ui/src/lib/guards/auth';
// import { getAuthContext } from 'apps/pm-ms-ui/src/lib/utils/auth';
// import { PermissionKey, ProjectRole } from '@prisma/client';

// export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   try {
//     const { id: projectId } = await params;
//     if (!projectId || typeof projectId !== 'string') throw new Error('Invalid project ID');

//     // Get authentication context
//     const authContext = await getAuthContext();

//     // Check authorization
//     await checkAuthorization(authContext, projectId, {
//       requireAuth: true,
//       requireProjectMember: true,
//       requirePermission: PermissionKey.BROWSE_PROJECTS,
//     });

//     // Parse query parameters
//     const { searchParams } = new URL(request.url);
//     const options = {
//       page: parseInt(searchParams.get('page') || '1'),
//       limit: Math.min(parseInt(searchParams.get('limit') || '10'), 100),
//       role: searchParams.get('role') as ProjectRole | undefined,
//       search: searchParams.get('search') || undefined,
//       includePermissions: searchParams.get('includePermissions') !== 'false',
//       includeInactive: searchParams.get('includeInactive') === 'true',
//     };

//     // Additional authorization for sensitive data
//     if (options.includePermissions) {
//       await checkAuthorization(authContext, projectId, {
//         requirePermission: PermissionKey.ADMIN_PROJECTS,
//       });
//     }

//     // Get members data
//     const result = await getProjectMembers(projectId, options, authContext?.user.id);

//     return NextResponse.json({
//       success: true,
//       data: result,
//       meta: {
//         timestamp: new Date().toISOString(),
//         requestId: authContext?.requestId,
//         requester: {
//           id: authContext?.user.id,
//           email: authContext?.user.email,
//         },
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching project members:', error);

//     if (error instanceof AuthorizationError) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: {
//             code: error.code,
//             message: error.message,
//           },
//           meta: {
//             timestamp: new Date().toISOString(),
//           },
//         },
//         { status: error.statusCode },
//       );
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         error: {
//           code: 'FETCH_MEMBERS_FAILED',
//           message: 'Failed to fetch members',
//         },
//         meta: {
//           timestamp: new Date().toISOString(),
//         },
//       },
//       { status: 500 },
//     );
//   }
// }
