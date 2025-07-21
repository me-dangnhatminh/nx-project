'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Code2, Palette, Lightbulb, Megaphone, Package, LucideIcon } from 'lucide-react';
import { Checkbox } from '@shadcn-ui/components/checkbox';
import { Badge } from '@shadcn-ui/components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn-ui/components/avatar';
import Link from 'next/link';
import { format } from 'date-fns';
import { ProjectActions } from './project-actions';
import { DataTableHeader } from './data-table-header';

import { Project, ProjectType } from 'apps/pm-ms-ui/src/lib/types';
import { useUser } from 'apps/pm-ms-ui/src/hooks/use-user';

const projectTypes: Record<ProjectType, string> = {
  SOFTWARE: 'Software',
  MARKETING: 'Marketing',
  RESEARCH: 'Research',
  DESIGN: 'Design',
  OTHER: 'Other',
};

const projectTypeColors: Record<ProjectType, string> = {
  SOFTWARE: 'bg-blue-50 text-blue-700 border-blue-200',
  MARKETING: 'bg-green-50 text-green-700 border-green-200',
  RESEARCH: 'bg-purple-50 text-purple-700 border-purple-200',
  DESIGN: 'bg-pink-50 text-pink-700 border-pink-200',
  OTHER: 'bg-gray-50 text-gray-700 border-gray-200',
};

// Helper function to get project type icon
const projectTypeIcons: Record<ProjectType, LucideIcon> = {
  SOFTWARE: Code2,
  MARKETING: Megaphone,
  RESEARCH: Lightbulb,
  DESIGN: Palette,
  OTHER: Package,
};

export const projectColumns: ColumnDef<Project>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => <DataTableHeader column={column} title='Name' />,
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className='max-w-[300px]'>
          <Link
            href={`/projects/${project.id}`}
            className='font-medium hover:underline block truncate'
          >
            {project.name}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: 'key',
    header: ({ column }) => <DataTableHeader column={column} title='Key' />,
    cell: ({ row }) => {
      const project = row.original;
      return <span className='font-mono text-sm'>{project.key}</span>;
    },
  },

  {
    accessorKey: 'type',
    header: ({ column }) => <DataTableHeader column={column} title='Type' />,
    cell: ({ row }) => {
      const type = row.getValue('type') as ProjectType;
      const Icon = projectTypeIcons[type];
      if (!Icon) return <span className='text-muted-foreground'>Unknown</span>;
      return (
        <Badge variant='outline' className={projectTypeColors[type]}>
          <Icon className='h-4 w-4 mr-1' />
          {projectTypes[type]}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'lead',
    header: ({ column }) => <DataTableHeader column={column} title='Lead' />,
    cell: ({ row }) => {
      const project = row.original;
      const leadId = project.leadId;
      const { fetchUser } = useUser(leadId, { type: 'project' });
      const lead = fetchUser.data;
      if (fetchUser.isPending) return <span className='text-muted-foreground'>...</span>;
      if (!lead) return <span className='text-muted-foreground'>No lead</span>;

      return (
        <div className='flex items-center space-x-2'>
          <Avatar className='h-6 w-6'>
            <AvatarImage src={lead.picture} alt={`${lead.displayName}`} />
            <AvatarFallback className='text-xs'>{lead.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <p className='text-sm font-medium truncate'>{lead.displayName || lead.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableHeader column={column} title='Created' />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return <div className='text-sm'>{format(date, 'MMM d, yyyy')}</div>;
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <DataTableHeader column={column} title='Updated' />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('updatedAt'));
      return <div className='text-sm text-muted-foreground'>{format(date, 'MMM d, yyyy')}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const project = row.original;
      const id = project.id;
      return <ProjectActions projectId={id} />;
    },
  },
];
