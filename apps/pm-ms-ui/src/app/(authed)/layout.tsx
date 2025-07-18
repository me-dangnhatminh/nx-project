'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='flex h-screen bg-gray-50 overflow-hidden'>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className='flex-1 flex flex-col min-w-0'>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className='flex-1 overflow-auto'>{children}</main>
      </div>
    </div>
  );
}
