'use client';

import React, { useMemo } from 'react';
import { InfoIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn-ui/components/select';
import { Card, CardContent } from '@shadcn-ui/components/card';
import { Label } from '@shadcn-ui/components/label';

import { Alert, AlertDescription } from '../common/alert';
import { cn } from '@shared/utils';
import { is } from 'node_modules/cheerio/dist/esm/api/traversing';

type AcademicYear = { id: string; label: string };
type Semester = { id: string; label: string };

interface AcademicSelectorProps {
  academics: AcademicYear[];
  semesters: Semester[];
  academic?: string;
  semester?: string;
  onSelectedAcademic: (value: string) => void;
  onSelectedSemester: (value: string) => void;
}

export const AcademicSelector: React.FC<AcademicSelectorProps> = ({
  academics,
  semesters,
  academic,
  semester,
  onSelectedAcademic,
  onSelectedSemester,
}) => {
  const isSearchEnabled = useMemo(() => {
    return !!academic && !!semester;
  }, [academic, semester]);

  return (
    <Card className={cn('p-2 sm:p-4', 'rounded-md sm:rounded-lg', 'select-none')}>
      <CardContent className={cn('p-0', 'flex flex-col gap-2 sm:gap-4')}>
        <div className={cn('grid grid-cols-2 gap-2 sm:gap-4')}>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='academic'>Academic Year</Label>
            <Select value={academic} onValueChange={(academic) => onSelectedAcademic?.(academic)}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select Academic Year' />
              </SelectTrigger>
              <SelectContent>
                {academics.map((academic, idx) => (
                  <SelectItem key={idx} value={academic.id}>
                    {academic.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex flex-col gap-1'>
            <Label htmlFor='semester'>Semester</Label>
            <Select
              value={semester}
              onValueChange={(semester) => {
                onSelectedSemester?.(semester);
              }}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select Semester' />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester, idx: number) => (
                  <SelectItem key={idx} value={semester.id}>
                    {semester.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Alert
          hidden={isSearchEnabled}
          variant='info'
          className='bg-blue-50 text-blue-800 border-blue-100'
        >
          <InfoIcon className='h-4 w-4' />
          <AlertDescription>
            Please select both Academic Year and Semester to search for courses.
          </AlertDescription>
        </Alert>

        <div hidden={!isSearchEnabled} className='text-sm'>
          <span className='font-medium'>Selected:</span> {academic},{' '}
          <span>{semesters.find((s) => s.id === semester)?.label}</span>
        </div>
      </CardContent>
    </Card>
  );
};
