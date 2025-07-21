import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { Input } from '@shadcn-ui/components/input';
import { useUserSearch } from 'apps/pm-ms-ui/src/hooks/use-user';
import { User } from 'apps/pm-ms-ui/src/lib/types';

export type UserSelectionFormProps = {
  select?: { id: string; avatar?: string };
  onSelect?: (user: User) => void;
};

export const UserSelectionForm = ({ onSelect }: UserSelectionFormProps) => {
  const [debouncedText, setDebouncedText] = useState('');
  const userSearchDebounced = useCallback(debounce(setDebouncedText, 300), []);

  const searchUsers = useUserSearch(debouncedText);
  const users = searchUsers.data?.items || [];

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <Input
          type='text'
          onChange={({ target }) => userSearchDebounced(target.value)}
          placeholder='Search for a user...'
          className='flex-1'
        />
      </div>
      <div className='flex flex-col gap-2'>
        {users
          .slice(0, 5)
          .map((user) => ({
            ...user,
            name: `${user.firstName} ${user.lastName}`.trim(),
          }))
          .map((user) => (
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
