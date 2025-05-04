import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateViewProps {
  icon: LucideIcon;
  title: string;
  description: string;
  hidden?: boolean;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  icon: Icon,
  title,
  description,
  hidden,
}) => {
  if (hidden) return null;
  return (
    <div className='py-10 text-center'>
      <Icon className='mx-auto h-12 w-12 text-muted-foreground/60' />
      <h3 className='mt-2 text-sm font-medium'>{title}</h3>
      <p className='mt-1 text-sm text-muted-foreground'>{description}</p>
    </div>
  );
};
