import React from 'react';
import { Button } from './button';
import { Separator } from '@shadcn-ui/components/separator';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { ConflictResult } from '@shared/types/dtutool';

interface RegistrationActionProps {
  scheduleConflicts: ConflictResult[];
  activeClassroomIdxs: boolean[];
}

export const RegistrationAction: React.FC<RegistrationActionProps> = ({
  scheduleConflicts,
  activeClassroomIdxs,
}) => {
  const activeCoursesCount = activeClassroomIdxs.filter(Boolean).length;
  const hasConflicts = scheduleConflicts.length > 0;
  const isDisabled = activeCoursesCount === 0 || hasConflicts;

  return (
    <div className='pt-3'>
      <Separator className='mb-3' />

      <Button disabled={isDisabled} variant={isDisabled ? 'outline' : 'success'} className='w-full'>
        Complete Registration
      </Button>

      {hasConflicts && (
        <div className='flex items-center gap-2 mt-2 text-sm text-destructive'>
          <AlertCircle className='h-4 w-4' />
          <p>Please resolve schedule conflicts before registration</p>
        </div>
      )}

      {activeCoursesCount === 0 && !hasConflicts && (
        <div className='flex items-center gap-2 mt-2 text-sm text-muted-foreground'>
          <AlertTriangle className='h-4 w-4' />
          <p>Select at least one course to register</p>
        </div>
      )}

      {!hasConflicts && activeCoursesCount > 0 && (
        <div className='flex items-center gap-2 mt-2 text-sm text-success'>
          <CheckCircle className='h-4 w-4' />
          <p>You are ready to register!</p>
        </div>
      )}
    </div>
  );
};
