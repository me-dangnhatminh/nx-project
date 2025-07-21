import { ProjectType as PrismaProjectType } from '@prisma/client';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
};

export type ProjectType = PrismaProjectType;

export type Project = {
  id: string;
  key: string;
  name: string;
  type: ProjectType;
  leadId: string;
  description?: string;
  avatarId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectMember = {
  user: User;
  role: string;
};

export type IssueType = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
};

export type IssueStatus = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  sequence: number;
};

export type IssuePriority = {
  id: string;
  name: string;
  description?: string;
  color?: string;
};

export type Issue = {
  id: string;
  key: string;
  summary: string;
  description?: string;
  typeId: string;
  statusId: string;
  priorityId: string;
  projectId: string;
  reporterId?: string;
  assigneeId?: string;
  dueDate?: string;
  resolutionId?: string;
  createdAt: string;
  updatedAt: string;

  rank: string;
};
