'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@shadcn-ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn-ui/components/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shadcn-ui/components/dialog';
import { useMutation } from '@tanstack/react-query';
import { UserSelectionForm } from 'apps/pm-ms-ui/src/components/project/user-select-form';
import { projectApi } from 'apps/pm-ms-ui/src/lib/api/project';
import { toast } from 'sonner';

export function ProjectAction(props: {
  projectId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { projectId } = props;
  const [openAssignDialog, setOpenAssignDialog] = useState(false);

  const memberInviteMutation = useMutation({
    mutationFn: async (param: Parameters<typeof projectApi.memberInvite>[0]) => {
      await toast.promise(projectApi.memberInvite(param), {
        loading: 'Inviting user...',
        success: 'User invited successfully',
        error: 'Failed to invite user',
      });
    },
  });

  const onDelete = useMutation({
    mutationFn: async () => {
      await toast.promise(projectApi.delete(projectId), {
        loading: 'Deleting project...',
        success: 'Project deleted successfully',
        error: 'Failed to delete project',
      });
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon'>
            <MoreHorizontal className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setOpenAssignDialog(true)}>Invite User</DropdownMenuItem>
          <DropdownMenuItem onClick={props.onEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete.mutate()}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openAssignDialog} onOpenChange={setOpenAssignDialog}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>Select a user to invite to this project.</DialogDescription>
          </DialogHeader>
          <UserSelectionForm
            onSelect={(user) => {
              if (user?.id) {
                memberInviteMutation.mutate({ projectId, inviteeId: user.id });
                setOpenAssignDialog(false);
              } else {
                toast.error('Please select a valid user');
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
