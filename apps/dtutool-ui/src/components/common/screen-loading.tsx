'use client';

import { cn } from '@shared/utils';
import { Loader2Icon } from 'lucide-react';

export function FullLoading(props: { loaderClassname?: string }) {
  return (
    <span className='w-full h-full flex items-center justify-center'>
      <Loader2Icon className={cn(props.loaderClassname)} />
    </span>
  );
}

export function ScreenLoading(props: { loaderClassname?: string }) {
  return (
    <span className='w-screen h-screen flex items-center justify-center'>
      <Loader2Icon className={cn('animate-spin', props.loaderClassname)} />
    </span>
  );
}
