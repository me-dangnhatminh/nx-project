'use client';

import { cn } from '@shared/utils';
import { DataTable } from './table/data-table';
import { projectColumns } from './table/project-column';
import { useProjects } from 'apps/pm-ms-ui/src/hooks/use-project';
import { DataTableToolbar } from './table/data-table-toolbar';
import { DataTablePagination } from './table/data-table-pagination';

export default function ProjectsPage() {
  const { projects, fetchProjects } = useProjects();

  if (fetchProjects.isPending) return <div>Loading...</div>;

  return (
    <section className={cn('w-full h-full', 'relative')}>
      <div
        id='projects-header'
        className={cn(
          'w-full h-16 flex items-center justify-between',
          'px-4 sm:px-6 lg:px-8',
          'bg-white border-b border-gray-200',
        )}
      >
        <h1 className='block text-2xl font-bold tracking-wide'>Projects</h1>
      </div>

      <div id='projects-toolbar' className={cn('w-full', 'p-4 sm:p-6 lg:p-8')}>
        <DataTable
          data={projects}
          columns={projectColumns}
          DataTableToolbar={DataTableToolbar}
          DataTablePagination={DataTablePagination}
        />
      </div>
    </section>
  );
}

{
  /* <div
        id='projects-header'
        className={cn(
          'w-full h-16 flex items-center justify-between',
          'px-4 sm:px-6 lg:px-8',
          'bg-white border-b border-gray-200',
        )}
      >
        <h1 className='block text-2xl font-bold tracking-wide'>Projects</h1>
        <div>
          <Button variant='outline'>Create Project</Button>
        </div>
      </div>

      <div
        id='projects-toolbar'
        className={cn(
          'w-full flex items-center justify-between',
          'px-4 sm:px-6 lg:px-8',
          'bg-white border-b border-gray-200',
        )}
      >
        <div className='flex items-center space-x-4'>
          <Button variant='outline'>Filter</Button>
          <Button variant='outline'>Sort</Button>
        </div>
      </div>

      <div
        id='projects-table'
        className={cn('w-full h-full', 'px-4 sm:px-6 lg:px-8', 'bg-white border-b border-gray-200')}
      >
        hello
      </div>

      <div
        id='projects-creation-panel'
        className={cn(
          'w-screen h-screen fixed bottom-0 left-0 z-50',
          'bg-white',
          'flex items-center justify-center',
        )}
      ></div> */
}
