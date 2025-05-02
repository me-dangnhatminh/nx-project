'use client';

import React, { useMemo } from 'react';
import { InfoIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/components/select';
import { Card, CardContent } from '@ui/components/card';
import { Label } from '@ui/components/label';

import { Alert, AlertDescription } from './alert';

type AcademicYear = { id: string; label: string };
type Semester = { id: string; label: string };

interface AcademicPeriodSelectorProps {
  academics: AcademicYear[];
  semesters: Semester[];
  academic?: string;
  semester?: string;
  onSelectedAcademic: (value: string) => void;
  onSelectedSemester: (value: string) => void;
}

export const AcademicPeriodSelector: React.FC<AcademicPeriodSelectorProps> = ({
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
    <Card>
      {/* <CardHeader>
        <CardTitle className="text-sm font-medium text-primary">
          Academic Period Selection
        </CardTitle>
      </CardHeader> */}
      <CardContent className="flex flex-col space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="academic">Academic Year</Label>
            <Select
              value={academic}
              onValueChange={(academic) => {
                onSelectedAcademic?.(academic);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Academic Year" />
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

          <div className="flex flex-col gap-1">
            <Label htmlFor="semester">Semester</Label>
            <Select
              value={semester}
              onValueChange={(semester) => {
                onSelectedSemester?.(semester);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Semester" />
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

        {!isSearchEnabled ? (
          <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-100">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Please select both Academic Year and Semester to search for courses.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="text-sm">
            <span className="font-medium">Current selection:</span> {academic},{' '}
            {semesters.find((s) => s.id === semester)?.label}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
