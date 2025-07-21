'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';

import { DataTableHeader } from './data-table-header';
import { Checkbox } from '@shadcn-ui/components/checkbox';
import { Badge } from '@shadcn-ui/components/badge';
import { Issue } from 'apps/pm-ms-ui/src/lib/types';
import {
  useIssuePriorities,
  useIssueStatues,
  useIssueTypes,
} from 'apps/pm-ms-ui/src/hooks/use-issue';

export const issueColumns: ColumnDef<Issue>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => <DataTableHeader column={column} title='Type' />,
    cell: ({ row }) => {
      const { id: projectId } = useParams<{ id: string }>();
      const typeId = row.original.typeId;
      const { fetchIssueTypes, issueTypes } = useIssueTypes(projectId);
      if (fetchIssueTypes.isPending) return '...';
      const type = issueTypes.find((t) => t.id === typeId);
      return (
        <Badge className='capitalize' style={{ backgroundColor: type?.color }}>
          {type?.name}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'key',
    header: ({ column }) => <DataTableHeader column={column} title='Key' />,
    cell: ({ row }) => (
      <Link href={`/projects/${row.original.projectId}/issues/${row.original.id}`}>
        {row.original.key}
      </Link>
    ),
  },
  {
    accessorKey: 'summary',
    header: ({ column }) => <DataTableHeader column={column} title='Summary' />,
    cell: ({ row }) => row.original.summary,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableHeader column={column} title='Status' />,
    cell: ({ row }) => {
      const { id: projectId } = useParams<{ id: string }>();
      const statusId = row.original.statusId;
      const { fetchIssueStatuses, issueStatuses } = useIssueStatues(projectId);
      if (fetchIssueStatuses.isPending) return '...';
      const status = issueStatuses.find((s) => s.id === statusId);
      return (
        <Badge className='capitalize' style={{ backgroundColor: status?.color }}>
          {status?.name}
        </Badge>
      );
    },
    sortingFn: (rowA, rowB) => {
      const statusA = rowA.original.statusId;
      const statusB = rowB.original.statusId;
      return statusA.localeCompare(statusB);
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => <DataTableHeader column={column} title='Priority' />,
    cell: ({ row }) => {
      const { id: projectId } = useParams<{ id: string }>();
      const priorityId = row.original.priorityId;
      const { fetchIssuePriorities, issuePriorities } = useIssuePriorities(projectId);
      if (fetchIssuePriorities.isPending) return '...';
      const priority = issuePriorities.find((p) => p.id === priorityId);
      return (
        <Badge className='capitalize' style={{ backgroundColor: priority?.color }}>
          {priority?.name}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'reporter',
    header: ({ column }) => <DataTableHeader column={column} title='Reporter' />,
    cell: ({ row }) => row.original.reporterId,
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => <DataTableHeader column={column} title='Due Date' />,
    cell: ({ row }) =>
      row.original?.dueDate && format(new Date(row.original.dueDate), 'MMM dd, yyyy'),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableHeader column={column} title='Created At' />,
    cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <DataTableHeader column={column} title='Updated At' />,
    cell: ({ row }) => format(new Date(row.original.updatedAt), 'MMM dd, yyyy'),
  },
];
