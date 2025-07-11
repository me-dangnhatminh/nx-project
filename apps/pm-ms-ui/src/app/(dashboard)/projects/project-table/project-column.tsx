'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@shadcn-ui/components/checkbox';
import Link from 'next/link';
import { Project } from '@prisma/client';

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
    header: 'Project Name',
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className='font-medium cursor-pointer'>
          <Link href={`/projects/${project.id}`} className='hover:underline'>
            {project.name}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: 'key',
    header: 'Key',
    cell: ({ row }) => row.getValue('key'),
    enableSorting: true,
  },
  {
    accessorKey: 'lead',
    header: 'Lead',
    cell: ({ row }) => {
      const lead: any = row.getValue('lead');
      return lead?.name || 'No Lead';
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <>Action</>,
  },
];
