// assignee-selection-form

import React, { useState, useCallback } from 'react';
import { Input } from '@shadcn-ui/components/input';
import { userApi } from 'apps/pm-ms-ui/src/lib/api/user';

export const AssigneeSelectionForm = ({
  onSelect,
}: {
  select?: { id: string; avatar?: string };
  onSelect?: (user: any) => void;
} = {}) => {
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState<
    {
      id: string;
      name: string;
      email: string;
      picture?: string;
    }[]
  >([]);

  const handleSearch = useCallback(async (text: string) => {
    if (!text) {
      setUsers([]);
      return;
    }
    try {
      const result = await userApi.searchUser(text);
      setUsers(
        result.items?.map((u) => ({
          ...u,
          name: `${u.firstName} ${u.lastName}`.trim(),
          picture: u.avatar || u.picture,
        })) || [],
      );
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  }, []);

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <Input
          type='text'
          onChange={(e) => {
            const text = e.target.value;
            setSearchText(text);
            handleSearch(text);
          }}
          value={searchText}
          placeholder='Search for a user...'
          className='flex-1'
        />
      </div>
      <div className='flex flex-col gap-2'>
        {users.slice(0, 5).map((user) => (
          <div
            key={user.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(user);
            }}
            className='p-2 flex items-center gap-2 hover:bg-gray-100 transition-colors'
          >
            {user.picture && (
              <img src={user.picture} alt={user.name} className='h-8 w-8 rounded-full' />
            )}
            <div className='flex flex-col'>
              <span className='font-semibold'>{user.name}</span>
              <span className='text-sm text-muted-foreground'>{user.email}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
