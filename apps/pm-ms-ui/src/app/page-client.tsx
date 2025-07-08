'use client';

import { Button } from '@shadcn-ui/components/button';
import { useEffect, useState } from 'react';

export default function Index() {
  const [users, setUsers] = useState<{ id: number; name: string; email: string }[] | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const res = await response.json();
        const data = res.data || res;
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className='flex h-screen flex-col items-center justify-center bg-gray-100 p-4'>
      <div className='max-w-md w-full bg-white p-6 rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold mb-4'>Welcome to PM MS UI</h1>
        <p className='text-gray-700'>
          This is a simple page to display users fetched from the API.
        </p>
        <Button
          className='mt-4 w-full'
          role='button'
          onClick={() => {
            window.location.href = '/signin';
          }}
        >
          Login
        </Button>
      </div>

      <div className='mt-8 max-w-md w-full bg-white p-6 rounded-lg shadow-md'>
        <h2 className='text-lg font-semibold'>Users:</h2>
        {users === null && <p className='text-sm text-gray-500'>Loading users...</p>}
        {users === undefined && <p className='text-sm text-red-500'>Failed to load users.</p>}
        {users && users.length === 0 && <p className='text-sm text-gray-500'>No users found.</p>}
        {users && users.length > 0 && <p className='text-sm text-gray-500'>List of users:</p>}
        <ul className='mt-2 space-y-2'>
          {users &&
            users.map((user) => (
              <li key={user.id} className='p-2 bg-white rounded shadow'>
                <p className='font-semibold'>{user.name}</p>
                <p className='text-sm text-gray-600'>{user.email}</p>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
