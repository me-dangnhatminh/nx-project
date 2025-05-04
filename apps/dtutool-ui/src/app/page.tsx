'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { SchedulerWrapper } from '@schedule-ui/components/schedular-wrapper';
import { Button } from '@schedule-ui/components/button';
import { SchedulerProvider } from '@schedule-ui/providers/schedular-provider';

export default function Index() {
  return (
    <SchedulerProvider>
      <AnimatePresence>
        <motion.div
          className='fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className='bg-card border rounded-lg w-full max-w-[1500px] max-h-[95vh] overflow-auto'
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div className='flex justify-between items-center p-4 border-b'>
              <h2 className='text-2xl font-bold'>Mina Scheduler Demo</h2>
              <Button variant='ghost' size='sm'>
                Close
              </Button>
            </div>
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className='p-4'
            >
              <SchedulerWrapper />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </SchedulerProvider>
  );
}
