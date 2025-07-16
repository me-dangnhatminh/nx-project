// import { prisma } from '../prisma';
// import { CreateIssueInput, UpdateIssueInput, IssueQueryInput } from '../types/issue';
// import { NextRequest } from 'next/server';

// export class IssueService {
//   // Get current user ID from request cookies
//   private getCurrentUserId(request?: NextRequest): string {
//     if (!request) {
//       throw new Error('Request object is required to get current user');
//     }

//     const userIdCookie = request.cookies.get('x-user-id');

//     if (!userIdCookie || !userIdCookie.value) {
//       throw new Error('User not authenticated. Missing x-user-id cookie.');
//     }

//     return userIdCookie.value;
//   }

//   async createIssue(data: CreateIssueInput, request: NextRequest) {
//     const currentUserId = this.getCurrentUserId(request);

//     // Validate that the project exists
//     const project = await prisma.project.findUnique({
//       where: { id: data.projectId },
//     });

//     if (!project) {
//       throw new Error('Project not found');
//     }

//     // Validate that referenced entities exist
//     const [type, status, priority] = await Promise.all([
//       prisma.issueType.findUnique({ where: { id: data.typeId } }),
//       prisma.issueStatus.findUnique({ where: { id: data.statusId } }),
//       prisma.priority.findUnique({ where: { id: data.priorityId } }),
//     ]);

//     if (!type) throw new Error('Issue type not found');
//     if (!status) throw new Error('Issue status not found');
//     if (!priority) throw new Error('Priority not found');

//     // Validate assignee and reporter if provided
//     if (data.assigneeId) {
//       const assignee = await prisma.user.findUnique({ where: { id: data.assigneeId } });
//       if (!assignee) throw new Error('Assignee not found');
//     }

//     if (data.reporterId) {
//       const reporter = await prisma.user.findUnique({ where: { id: data.reporterId } });
//       if (!reporter) throw new Error('Reporter not found');
//     }

//     const issue = await prisma.issue.create({
//       data: {
//         ...data,
//         creatorId: currentUserId,
//         reporterId: data.reporterId || currentUserId,
//         dueDate: data.dueDate ? new Date(data.dueDate) : null,
//       },
//       include: {
//         project: true,
//         creator: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             avatar: true,
//           },
//         },
//         reporter: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             avatar: true,
//           },
//         },
//         assignee: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             avatar: true,
//           },
//         },
//         type: true,
//         status: true,
//         priority: true,
//         resolution: true,
//       },
//     });

//     return issue;
//   }

//   async getIssues(query: IssueQueryInput, request?: NextRequest) {
//     let currentUserId: string | null = null;

//     if (request) {
//       try {
//         currentUserId = this.getCurrentUserId(request);
//       } catch (error) {
//         console.warn('No authenticated user for getIssues:', error);
//       }
//     }

//     const { page, limit, search, ...filters } = query;
//     const skip = (page - 1) * limit;

//     const where: any = {
//       archived: filters.archived ?? false,
//     };

//     // Add filters
//     if (filters.projectId) where.projectId = filters.projectId;
//     if (filters.assigneeId) where.assigneeId = filters.assigneeId;
//     if (filters.reporterId) where.reporterId = filters.reporterId;
//     if (filters.statusId) where.statusId = filters.statusId;
//     if (filters.typeId) where.typeId = filters.typeId;
//     if (filters.priorityId) where.priorityId = filters.priorityId;

//     // Add search functionality
//     if (search) {
//       where.OR = [
//         { key: { contains: search, mode: 'insensitive' } },
//         { summary: { contains: search, mode: 'insensitive' } },
//         { description: { contains: search, mode: 'insensitive' } },
//       ];
//     }

//     const [issues, total, statuses] = await Promise.all([
//       prisma.issue.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { createdAt: 'desc' },
//         include: {
//           project: {
//             select: {
//               id: true,
//               key: true,
//               name: true,
//             },
//           },
//           creator: {
//             select: {
//               id: true,
//               email: true,
//               firstName: true,
//               lastName: true,
//               avatar: true,
//             },
//           },
//           reporter: {
//             select: {
//               id: true,
//               email: true,
//               firstName: true,
//               lastName: true,
//               avatar: true,
//             },
//           },
//           assignee: {
//             select: {
//               id: true,
//               email: true,
//               firstName: true,
//               lastName: true,
//               avatar: true,
//             },
//           },
//           type: true,
//           status: true,
//           priority: true,
//           resolution: true,
//         },
//       }),
//       prisma.issue.count({ where }),
//       prisma.issueStatus.findMany({
//         orderBy: { sequence: 'asc' },
//       }),
//     ]);

//     return {
//       issues,
//       statuses,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//         hasNext: page * limit < total,
//         hasPrev: page > 1,
//       },
//       currentUserId,
//     };
//   }

//   async getIssueById(id: string, request?: NextRequest) {
//     let currentUserId: string | null = null;

//     if (request) {
//       try {
//         currentUserId = this.getCurrentUserId(request);
//       } catch (error) {
//         console.warn('No authenticated user for getIssueById:', error);
//       }
//     }

//     const issue = await prisma.issue.findUnique({
//       where: { id },
//       include: {
//         project: true,
//         creator: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             avatar: true,
//           },
//         },
//         reporter: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             avatar: true,
//           },
//         },
//         assignee: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             avatar: true,
//           },
//         },
//         archivedUser: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//           },
//         },
//         type: true,
//         status: true,
//         priority: true,
//         resolution: true,
//       },
//     });

//     if (!issue) {
//       throw new Error('Issue not found');
//     }

//     return { ...issue, currentUserId };
//   }

//   async updateIssue(id: string, data: UpdateIssueInput, request: NextRequest) {
//     const currentUserId = this.getCurrentUserId(request);

//     // Check if issue exists
//     const existingIssue = await prisma.issue.findUnique({
//       where: { id },
//     });

//     if (!existingIssue) {
//       throw new Error('Issue not found');
//     }

//     // Validate referenced entities if they are being updated
//     if (data.typeId) {
//       const type = await prisma.issueType.findUnique({ where: { id: data.typeId } });
//       if (!type) throw new Error('Issue type not found');
//     }

//     if (data.statusId) {
//       const status = await prisma.issueStatus.findUnique({ where: { id: data.statusId } });
//       if (!status) throw new Error('Issue status not found');
//     }

//     if (data.priorityId) {
//       const priority = await prisma.priority.findUnique({ where: { id: data.priorityId } });
//       if (!priority) throw new Error('Priority not found');
//     }

//     if (data.assigneeId) {
//       const assignee = await prisma.user.findUnique({ where: { id: data.assigneeId } });
//       if (!assignee) throw new Error('Assignee not found');
//     }

//     if (data.reporterId) {
//       const reporter = await prisma.user.findUnique({ where: { id: data.reporterId } });
//       if (!reporter) throw new Error('Reporter not found');
//     }

//     if (data.resolutionId) {
//       const resolution = await prisma.resolution.findUnique({ where: { id: data.resolutionId } });
//       if (!resolution) throw new Error('Resolution not found');
//     }

//     // Handle archiving
//     const updateData: any = {
//       ...data,
//       dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
//     };

//     if (data.archived === true && !existingIssue.archived) {
//       updateData.archivedAt = new Date();
//       updateData.archivedBy = currentUserId;
//     } else if (data.archived === false && existingIssue.archived) {
//       updateData.archivedAt = null;
//       updateData.archivedBy = null;
//     }

//     const issue = await prisma.issue.update({
//       where: { id },
//       data: updateData,
//       include: {
//         project: true,
//         creator: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             avatar: true,
//           },
//         },
//         reporter: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             avatar: true,
//           },
//         },
//         assignee: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             avatar: true,
//           },
//         },
//         archivedUser: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//           },
//         },
//         type: true,
//         status: true,
//         priority: true,
//         resolution: true,
//       },
//     });

//     return issue;
//   }

//   async deleteIssue(id: string, request: NextRequest) {
//     const currentUserId = this.getCurrentUserId(request);

//     // Check if issue exists
//     const existingIssue = await prisma.issue.findUnique({
//       where: { id },
//     });

//     if (!existingIssue) {
//       throw new Error('Issue not found');
//     }

//     // Instead of hard delete, we archive the issue
//     const issue = await prisma.issue.update({
//       where: { id },
//       data: {
//         archived: true,
//         archivedAt: new Date(),
//         archivedBy: currentUserId,
//       },
//       include: {
//         project: true,
//         creator: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             avatar: true,
//           },
//         },
//         reporter: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             avatar: true,
//           },
//         },
//         assignee: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//             avatar: true,
//           },
//         },
//         archivedUser: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//           },
//         },
//         type: true,
//         status: true,
//         priority: true,
//         resolution: true,
//       },
//     });

//     return {
//       success: true,
//       message: 'Issue archived successfully',
//       data: issue,
//     };
//   }

//   async hardDeleteIssue(id: string, request: NextRequest) {
//     const currentUserId = this.getCurrentUserId(request);

//     // Check if issue exists
//     const existingIssue = await prisma.issue.findUnique({
//       where: { id },
//     });

//     if (!existingIssue) {
//       throw new Error('Issue not found');
//     }

//     await prisma.issue.delete({
//       where: { id },
//     });

//     return {
//       success: true,
//       message: 'Issue permanently deleted',
//       deletedBy: currentUserId,
//     };
//   }

//   async getProjectData(projectId: string, request?: NextRequest) {
//     let currentUserId: string | null = null;

//     if (request) {
//       try {
//         currentUserId = this.getCurrentUserId(request);
//       } catch (error) {
//         console.warn('No authenticated user for getProjectData:', error);
//       }
//     }

//     const [project, statuses, issues] = await Promise.all([
//       prisma.project.findUnique({
//         where: { id: projectId },
//         select: {
//           id: true,
//           key: true,
//           name: true,
//           description: true,
//         },
//       }),
//       prisma.issueStatus.findMany({
//         orderBy: { sequence: 'asc' },
//       }),
//       prisma.issue.findMany({
//         where: {
//           projectId: projectId,
//           archived: false,
//         },
//         orderBy: { createdAt: 'desc' },
//         include: {
//           project: {
//             select: {
//               id: true,
//               key: true,
//               name: true,
//             },
//           },
//           creator: {
//             select: {
//               id: true,
//               email: true,
//               firstName: true,
//               lastName: true,
//               avatar: true,
//             },
//           },
//           reporter: {
//             select: {
//               id: true,
//               email: true,
//               firstName: true,
//               lastName: true,
//               avatar: true,
//             },
//           },
//           assignee: {
//             select: {
//               id: true,
//               email: true,
//               firstName: true,
//               lastName: true,
//               avatar: true,
//             },
//           },
//           type: true,
//           status: true,
//           priority: true,
//           resolution: true,
//         },
//       }),
//     ]);

//     if (!project) {
//       throw new Error('Project not found');
//     }

//     return {
//       project,
//       statuses,
//       issues,
//       currentUserId,
//     };
//   }
// }

// export const issueService = new IssueService();

import issueCreate from './issue-create';
import issueDelete from './issue-delete';
import issueListBoard from './issue-list-board';

import gIssueList from './q-issue-list';

export { issueCreate, issueListBoard, gIssueList, issueDelete };
