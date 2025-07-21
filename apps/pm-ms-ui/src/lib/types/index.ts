import {
  Issue as PrismaIssue,
  ProjectType as PrismaProjectType,
  IssueType as PrismaIssueType,
  IssuePriority as PrismaIssuePriority,
  IssueStatus as PrismaIssueStatus,
  Project as PrismaProject,
} from '@prisma/client';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
};

export type ProjectType = PrismaProjectType;
export type IssuePriority = PrismaIssuePriority;
export type IssueStatus = PrismaIssueStatus;
export type IssueType = PrismaIssueType;
export type Issue = PrismaIssue;
export type Project = Omit<PrismaProject, 'permissionSchemaId'>;
export type ProjectMember = { user: User; role: string };
