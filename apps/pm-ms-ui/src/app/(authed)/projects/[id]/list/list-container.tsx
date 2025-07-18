'use client';

import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@shadcn-ui/components/table';
import { useProjectIssues } from 'apps/pm-ms-ui/src/hooks/use-issue';
import { useProjectStatuses } from 'apps/pm-ms-ui/src/hooks/use-status';
import { useProject, useProjectMembers } from 'apps/pm-ms-ui/src/hooks/use-project';
import { format } from 'date-fns';

export default function ListContainer({ projectId }: { projectId: string }) {
  const { project } = useProject(projectId);
  const { issues, fetchIssues } = useProjectIssues(projectId);
  const { statuses } = useProjectStatuses(projectId);
  const { members } = useProjectMembers(projectId);

  const statusesMap = useMemo(() => {
    return statuses.reduce((acc, status) => {
      acc[status.id] = status;
      return acc;
    }, {} as Record<string, (typeof statuses)[0]>);
  }, [statuses]);

  const membersMap = useMemo(() => {
    return members.reduce((acc, member) => {
      acc[member.id] = member;
      return acc;
    }, {} as Record<string, (typeof members)[0]>);
  }, [members]);

  if (fetchIssues.isPending) return <div>Loading issues...</div>;

  return (
    <section className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>{project?.name || 'Project Issues'}</h1>
      <Table>
        <TableCaption>A list of issues for the project.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Key</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue.id}>
              <TableCell>{issue.key}</TableCell>
              <TableCell>{issue.summary}</TableCell>
              <TableCell>{statusesMap[issue.statusId]?.name}</TableCell>
              <TableCell>
                {issue.assigneeId ? (
                  <span>
                    {`${membersMap[issue.assigneeId]?.firstName}` +
                      ` ${membersMap[issue.assigneeId]?.lastName}`}
                  </span>
                ) : (
                  <span>Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                {issue.createdAt ? format(issue.createdAt, 'MMM dd, yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                {issue.updatedAt ? format(issue.updatedAt, 'MMM dd, yyyy') : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6}>
              <div className='w-full'>
                {/* create */}
                Create Issue
              </div>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3}>Total Issues: {issues.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </section>
  );
}
