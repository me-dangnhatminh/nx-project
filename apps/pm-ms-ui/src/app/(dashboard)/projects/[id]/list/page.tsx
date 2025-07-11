'use client';

import { useParams } from 'next/navigation';
import React, { useState } from 'react';

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

      <div id='project-detail-content' className='p-4 sm:p-6 lg:p-8'>
        {/* Project detail content goes here */}
        <p>Project details will be displayed here.</p>
        <p>ID: {id}</p>
      </div>
    </section>
  );
}
