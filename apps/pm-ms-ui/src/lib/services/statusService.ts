import { prisma } from '../prisma';
import { CreateStatusInput, UpdateStatusInput, StatusQueryInput } from '../types/status';
import { NextRequest } from 'next/server';

export class StatusService {
  // Get current user ID from request cookies
  private getCurrentUserId(request?: NextRequest): string {
    if (!request) {
      throw new Error('Request object is required to get current user');
    }

    const userIdCookie = request.cookies.get('x-user-id');

    if (!userIdCookie || !userIdCookie.value) {
      throw new Error('User not authenticated. Missing x-user-id cookie.');
    }

    return userIdCookie.value;
  }

  async createStatus(data: CreateStatusInput, request: NextRequest) {
    let sequence = data.sequence;
    if (sequence === undefined) {
      const lastStatus = await prisma.issueStatus.findFirst({
        orderBy: { sequence: 'desc' },
      });
      sequence = (lastStatus?.sequence || 0) + 10; // Add 10 for spacing
    }

    const status = await prisma.issueStatus.create({
      data: {
        name: data.name,
        description: data.description || `Status: ${data.name}`,
        color: data.color || '#6B7280', // Default gray color
        sequence: sequence,
      },
    });

    return status;
  }

  async getStatuses(query: StatusQueryInput = {}) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [statuses, total] = await Promise.all([
      prisma.issueStatus.findMany({
        skip,
        take: limit,
        orderBy: { sequence: 'asc' },
      }),
      prisma.issueStatus.count(),
    ]);

    return {
      statuses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getStatusById(id: string) {
    const status = await prisma.issueStatus.findUnique({
      where: { id },
    });

    if (!status) {
      throw new Error('Status not found');
    }

    return status;
  }

  async updateStatus(id: string, data: UpdateStatusInput, request: NextRequest) {
    const currentUserId = this.getCurrentUserId(request);

    // Check if status exists
    const existingStatus = await prisma.issueStatus.findUnique({
      where: { id },
    });

    if (!existingStatus) {
      throw new Error('Status not found');
    }

    const status = await prisma.issueStatus.update({
      where: { id },
      data: {
        ...data,
      },
    });

    return status;
  }

  async deleteStatus(id: string, request: NextRequest) {
    const currentUserId = this.getCurrentUserId(request);

    // Check if status exists
    const existingStatus = await prisma.issueStatus.findUnique({
      where: { id },
    });

    if (!existingStatus) {
      throw new Error('Status not found');
    }

    // Check if there are any issues using this status
    const issuesCount = await prisma.issue.count({
      where: { statusId: id },
    });

    if (issuesCount > 0) {
      throw new Error(`Cannot delete status. ${issuesCount} issues are using this status.`);
    }

    await prisma.issueStatus.delete({
      where: { id },
    });

    return { success: true, message: 'Status deleted successfully' };
  }

  async reorderStatuses(statusIds: string[], request: NextRequest) {
    const currentUserId = this.getCurrentUserId(request);

    // Update sequences based on order
    const updatePromises = statusIds.map((statusId, index) =>
      prisma.issueStatus.update({
        where: { id: statusId },
        data: { sequence: (index + 1) * 10 },
      }),
    );

    await Promise.all(updatePromises);

    const updatedStatuses = await prisma.issueStatus.findMany({
      where: { id: { in: statusIds } },
      orderBy: { sequence: 'asc' },
    });

    return updatedStatuses;
  }
}

export const statusService = new StatusService();
