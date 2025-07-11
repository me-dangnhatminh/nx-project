'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import BoardContainer from './bard-container';

export default function ProjectListPage() {
  const { id } = useParams();

  return (
    <section className='w-full h-full'>
      <div
        id='project-detail-header'
        className='w-full h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200'
      >
        <h1 className='block text-2xl font-bold tracking-wide'>Project Detail</h1>
      </div>

      <BoardContainer projectId={id as string} />
    </section>
  );
}
