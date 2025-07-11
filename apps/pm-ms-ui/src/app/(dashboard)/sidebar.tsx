'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FolderKanban,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@shared/utils';
import { Button } from '@shadcn-ui/components/button';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn-ui/components/avatar';

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const projects = [
  { id: '1', name: 'E-commerce Platform', key: 'ECP', avatar: '/project1.png' },
  { id: '2', name: 'Mobile App', key: 'MA', avatar: '/project2.png' },
  { id: '3', name: 'Website Redesign', key: 'WR', avatar: '/project3.png' },
];

export function Sidebar({ className, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className='fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden' onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
      >
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-gray-200 lg:border-b-0'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>PM</span>
              </div>
              <span className='font-semibold text-gray-900 hidden sm:block'>Project Manager</span>
            </div>

            {/* Mobile close button */}
            <Button variant='ghost' size='sm' className='lg:hidden' onClick={onClose}>
              <X className='h-5 w-5' />
            </Button>
          </div>

          {/* Navigation */}
          <div className='flex-1 overflow-y-auto p-4'>
            <nav className='space-y-1'>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    <item.icon className='w-5 h-5 mr-3 flex-shrink-0' />
                    <span className='truncate'>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Projects Section */}
            <div className='mt-6'>
              <div className='flex items-center justify-between px-3 py-2'>
                <div className='flex items-center min-w-0'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0 flex-shrink-0'
                    onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                  >
                    {isProjectsExpanded ? (
                      <ChevronDown className='h-4 w-4' />
                    ) : (
                      <ChevronRight className='h-4 w-4' />
                    )}
                  </Button>
                  <span className='ml-2 text-sm font-medium text-gray-700 truncate'>Projects</span>
                </div>
                <Button variant='ghost' size='sm' className='h-6 w-6 p-0 flex-shrink-0'>
                  <Plus className='h-4 w-4' />
                </Button>
              </div>

              {isProjectsExpanded && (
                <div className='space-y-1 ml-6'>
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      onClick={onClose}
                      className='flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg min-w-0'
                    >
                      <Avatar className='w-6 h-6 mr-3 flex-shrink-0'>
                        <AvatarImage src={project.avatar} />
                        <AvatarFallback className='text-xs'>{project.key}</AvatarFallback>
                      </Avatar>
                      <span className='truncate'>{project.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
