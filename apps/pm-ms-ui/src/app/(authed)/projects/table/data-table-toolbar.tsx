'use client';

import { Cross2Icon, PlusCircledIcon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { Button } from '@shadcn-ui/components/button';
import { Input } from '@shadcn-ui/components/input';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';
import { useState, useEffect, useCallback } from 'react';
import { CalendarIcon, Code2, Palette, Lightbulb, Megaphone, Package } from 'lucide-react';
import { cn } from '@shared/utils';
import { format } from 'date-fns';
import { Calendar } from '@shadcn-ui/components/calendar';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@shadcn-ui/components/popover';

import { ProjectType } from '@prisma/client'; // TODO: Adjust import based on your project structure

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const router = useRouter();
  const isFiltered = table.getState().columnFilters.length > 0;
  const [leads, setLeads] = useState<string[]>([]);
  const [permissionSchemes, setPermissionSchemes] = useState<string[]>([]);
  const [createdDate, setCreatedDate] = useState<Date | undefined>(undefined);
  const column = table.getColumn('createdAt');

  // Fetch leads and permission schemes from the API
  useEffect(() => {
    setLeads(['John Doe', 'Jane Smith', 'Bob Johnson']);
    setPermissionSchemes(['Default', 'Admin Only', 'Public', 'Restricted']);
  }, []);

  // Handle date selection
  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      setCreatedDate(date);
      if (date && column) {
        // Convert date to YYYYMMDD format for filtering
        const dateFormatted = format(date, 'yyyyMMdd');
        column.setFilterValue(parseInt(dateFormatted));
      } else if (column) {
        column.setFilterValue(undefined);
      }
    },
    [column],
  );

  return (
    <div className='flex flex-wrap items-center justify-between gap-2'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        <Input
          placeholder='Search projects...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />

        {/* Project Type Filter */}
        {table.getColumn('type') && (
          <DataTableFacetedFilter
            column={table.getColumn('type')}
            title='Project Type'
            options={[
              {
                label: 'Software',
                value: ProjectType.SOFTWARE,
                icon: Code2,
              },
              {
                label: 'Marketing',
                value: ProjectType.MARKETING,
                icon: Megaphone,
              },
              {
                label: 'Research',
                value: ProjectType.RESEARCH,
                icon: Lightbulb,
              },
              {
                label: 'Design',
                value: ProjectType.DESIGN,
                icon: Palette,
              },
              {
                label: 'Other',
                value: ProjectType.OTHER,
                icon: Package,
              },
            ]}
          />
        )}

        {/* Project Lead Filter */}
        {table.getColumn('lead') && leads.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn('lead')}
            title='Project Lead'
            options={leads.map((lead) => ({
              label: lead,
              value: lead,
            }))}
          />
        )}

        {/* Permission Scheme Filter */}
        {/* {table.getColumn('permissionSchema') && permissionSchemes.length > 0 && (
          <DataTableFacetedFilter
            column={table.getColumn('permissionSchema')}
            title='Permission Scheme'
            options={permissionSchemes.map((scheme) => ({
              label: scheme,
              value: scheme,
            }))}
          />
        )} */}

        {/* Created Date Filter */}
        {column && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className={cn('h-8 border-dashed', createdDate && 'text-muted-foreground')}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {createdDate ? format(createdDate, 'PPP') : 'Created Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='single'
                selected={createdDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}

        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => {
              table.resetColumnFilters();
              setCreatedDate(undefined);
            }}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <div className='flex items-center gap-2'>
        <Button
          variant='default'
          size='sm'
          className='h-8'
          onClick={() => router.push('/projects/create')}
        >
          <PlusCircledIcon className='mr-2 h-4 w-4' />
          Create Project
        </Button>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
