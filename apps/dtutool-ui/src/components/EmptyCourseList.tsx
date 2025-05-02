import React from 'react';
import { ClipboardList } from 'lucide-react';

export const EmptyCourseList: React.FC = () => {
  return (
    <div className="py-6 text-center">
      <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/60" />
      <h3 className="mt-2 text-sm font-medium text-foreground">No courses selected</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Use the search or browse to add courses to your selection
      </p>
    </div>
  );
};
