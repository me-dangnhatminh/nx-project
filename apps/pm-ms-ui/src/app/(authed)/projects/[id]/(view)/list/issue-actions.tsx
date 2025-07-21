'use client';

import { useCallback } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@shadcn-ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn-ui/components/dropdown-menu';

import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useProjects } from 'apps/pm-ms-ui/src/hooks/use-project';

export function ProjectActions(props: {
  projectId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { projectId } = props;
  const { deleteProject } = useProjects();
  const route = useRouter();

  const handleDelete = useCallback(() => {
    if (deleteProject.isPending) return;
    toast.promise(deleteProject.mutateAsync(projectId), {
      loading: 'Deleting project...',
      success: 'Project deleted successfully',
      error: (error) => `Failed to delete project: ${error.message}`,
    });
  }, [deleteProject]);

  // const { fetchMe } = useMe({ enabled: true });
  // const user = fetchMe.data;
  // const { fetchPermissions } = useProjectPermissions(props.projectId, user?.id || '');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='ml-auto'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => route.push(`/projects/${projectId}/members`)}>
            Invite User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={props.onEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
