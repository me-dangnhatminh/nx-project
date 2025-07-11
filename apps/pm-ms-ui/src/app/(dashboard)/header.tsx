'use client';

import { Search, Bell, Plus, User } from 'lucide-react';
import { Button } from '@shadcn-ui/components/button';
import { Input } from '@shadcn-ui/components/input';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn-ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shadcn-ui/components/dropdown-menu';
import { useCallback, useState } from 'react';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { useMe } from 'apps/pm-ms-ui/src/hooks/use-user';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const router = useRouter();
  const getMe = useMe(true);

  const handleSignOut = useCallback(async () => {
    try {
      await toast.promise(axios.post('/api/auth/signout', {}, { withCredentials: true }), {
        loading: 'Signing out...',
        success: 'Signed out successfully!',
        error: 'Sign out failed',
      });

      router.push('/signin');
    } catch (err) {
      console.error('Sign out error:', err);
      // Không cần toast.error nữa vì toast.promise đã xử lý
    }
  }, [router]);

  return (
    <header className='h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6'>
      {/* Left section */}
      <div className='flex items-center space-x-4'>
        {/* Mobile menu button */}
        <Button variant='ghost' size='sm' className='lg:hidden' onClick={onMenuClick}>
          <Menu className='h-5 w-5' />
        </Button>

        {/* Search */}
        <div className='hidden md:flex items-center flex-1 max-w-lg'>
          <div className='relative w-full'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input placeholder='Search issues, projects, people...' className='pl-10 pr-4 w-full' />
          </div>
        </div>

        {/* Mobile search button */}
        <Button
          variant='ghost'
          size='sm'
          className='md:hidden'
          onClick={() => setIsSearchExpanded(!isSearchExpanded)}
        >
          <Search className='h-5 w-5' />
        </Button>
      </div>

      {/* Right section */}
      <div className='flex items-center space-x-2 lg:space-x-4'>
        {/* Create button - responsive text */}
        <Button variant='outline' size='sm' className='hidden sm:flex'>
          <Plus className='w-4 h-4 mr-2' />
          Create
        </Button>

        {/* Mobile create button */}
        <Button variant='outline' size='sm' className='sm:hidden'>
          <Plus className='w-4 h-4' />
        </Button>

        {/* Notifications */}
        <Button variant='ghost' size='sm' className='relative'>
          <Bell className='w-5 h-5' />
          <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white'>
            3
          </span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
              <Avatar className='h-8 w-8'>
                <AvatarImage src={'https://via.placeholder.com/150'} alt='User' />
                <AvatarFallback>
                  <User className='w-4 h-4' />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end'>
            <DropdownMenuLabel>
              {getMe.data ? `${getMe.data.firstName} ${getMe.data.lastName}` : 'User'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                router.push('/profile');
              }}
            >
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Help</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className='text-red-600 hover:bg-red-50'>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile search overlay */}
      {isSearchExpanded && (
        <div className='absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 md:hidden'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <Input
              placeholder='Search issues, projects, people...'
              className='pl-10 pr-4 w-full'
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
