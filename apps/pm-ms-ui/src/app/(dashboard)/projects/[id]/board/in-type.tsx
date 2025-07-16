export const USERS = [
  { id: '1', name: 'John Doe', email: 'john.doe@example.com', avatar: '/avatars/john.jpg' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', avatar: '/avatars/jane.jpg' },
  { id: '3', name: 'Bob Wilson', email: 'bob.wilson@example.com', avatar: '/avatars/bob.jpg' },
];

export const MOCK_ACTIVITIES = [
  {
    id: '1',
    user: USERS[4], // Current user
    action: 'created the Task',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    type: 'HISTORY',
  },
  {
    id: '2',
    user: USERS[1],
    action: 'changed status from To Do to In Progress',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    type: 'HISTORY',
  },
  {
    id: '3',
    user: USERS[2],
    action: 'added a comment',
    content: "This looks good to me. Let's proceed with the implementation.",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    type: 'COMMENT',
  },
];

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Activity {
  id: string;
  user: User;
  action: string;
  content?: string;
  timestamp: Date;
  type: 'HISTORY' | 'COMMENT';
}
