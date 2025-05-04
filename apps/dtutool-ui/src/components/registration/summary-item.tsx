import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@shared/utils';

interface SummaryItemProps {
  icon: LucideIcon;
  label: string | React.ReactNode;
  value: string | React.ReactNode;
  valueClassName?: string;
}

export const SummaryItem: React.FC<SummaryItemProps> = ({
  icon: Icon,
  label,
  value,
  valueClassName,
}) => {
  return (
    <div className='flex justify-between items-center'>
      <div className='flex items-center gap-2'>
        <Icon className='h-4 w-4' />
        <span className='text-sm sm:text-base'>{label}</span>
      </div>
      <span className={cn(valueClassName)}>{value}</span>
    </div>
  );
};
