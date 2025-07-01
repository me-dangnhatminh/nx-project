'use client';

import { useState } from 'react';
import { Plus, Calendar, TrendingUp, Users, CheckCircle, Filter, FolderKanban } from 'lucide-react';
import { Button } from '@shadcn-ui/components/button';
import { Project, Issue, User } from '@shared/types/pmms';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn-ui/components/card';
import { ProjectCard } from '../../../components/project/project-card';
import { IssueCard } from '../../../components/issue/issue-card';

// Mock data
const mockUser: User = {
  id: '1',
  name: 'Minh Dang',
  email: 'me-dangnhatminh@example.com',
  avatar: '/avatar.png',
  role: 'admin',
};

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    key: 'ECP',
    description: 'Building a modern e-commerce platform with React and Node.js',
    type: 'software',
    lead: mockUser,
    category: 'Development',
    createdAt: '2025-01-15',
    updatedAt: '2025-06-30',
    status: 'active',
    members: [mockUser],
  },
  {
    id: '2',
    name: 'Mobile App',
    key: 'MA',
    description: 'Cross-platform mobile application using React Native',
    type: 'software',
    lead: mockUser,
    category: 'Mobile',
    createdAt: '2025-02-01',
    updatedAt: '2025-06-29',
    status: 'active',
    members: [mockUser],
  },
];

const mockIssues: Issue[] = [
  {
    id: '1',
    key: 'ECP-123',
    title: 'Implement user authentication system with OAuth integration',
    description: 'Add login and registration functionality',
    type: 'task',
    status: 'in_progress',
    priority: 'high',
    assignee: mockUser,
    reporter: mockUser,
    projectId: '1',
    labels: ['authentication', 'security'],
    components: [],
    fixVersions: [],
    createdAt: '2025-06-25',
    updatedAt: '2025-06-30',
    dueDate: '2025-07-05',
    estimatedTime: 8,
    attachments: [],
    comments: [
      {
        id: '1',
        content: 'Working on it',
        author: mockUser,
        createdAt: '2025-06-30',
        updatedAt: '2025-06-30',
        issueId: '1',
      },
    ],
  },
  {
    id: '2',
    key: 'MA-456',
    title: 'Fix critical navigation bug affecting iOS users',
    description: "Navigation doesn't work properly on iOS devices",
    type: 'bug',
    status: 'to_do',
    priority: 'highest',
    assignee: mockUser,
    reporter: mockUser,
    projectId: '2',
    labels: ['bug', 'ios', 'urgent'],
    components: [],
    fixVersions: [],
    createdAt: '2025-06-26',
    updatedAt: '2025-06-29',
    dueDate: '2025-07-02',
    attachments: [
      {
        id: '1',
        name: 'screenshot.png',
        url: '/screenshot.png',
        size: 1024,
        type: 'image/png',
        uploadedBy: mockUser,
        uploadedAt: '2025-06-26',
      },
    ],
    comments: [],
  },
];

export default function DashboardPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const stats = [
    {
      title: 'Active Projects',
      value: '4',
      icon: TrendingUp,
      change: '+2 from last month',
      color: 'text-blue-600',
    },
    {
      title: 'Assigned Issues',
      value: '12',
      icon: CheckCircle,
      change: '+3 from last week',
      color: 'text-green-600',
    },
    {
      title: 'Team Members',
      value: '8',
      icon: Users,
      change: '+1 from last month',
      color: 'text-purple-600',
    },
    {
      title: 'Due This Week',
      value: '5',
      icon: Calendar,
      change: '-2 from last week',
      color: 'text-orange-600',
    },
  ];

  return (
    <div className='p-4 sm:p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
          <p className='text-gray-600'>Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <div className='flex flex-col sm:flex-row gap-2'>
          <Button variant='outline' size='sm' className='sm:hidden'>
            <Filter className='w-4 h-4 mr-2' />
            Filter
          </Button>
          <Button>
            <Plus className='w-4 h-4 mr-2' />
            <span className='hidden sm:inline'>Create Issue</span>
            <span className='sm:hidden'>Create</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium truncate pr-2'>{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 flex-shrink-0 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-xs text-muted-foreground line-clamp-1'>{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        {/* Recent Projects */}
        <Card>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>Recent Projects</CardTitle>
              <Button variant='ghost' size='sm' className='text-blue-600'>
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {mockProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </CardContent>
        </Card>

        {/* Assigned Issues */}
        <Card>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg'>Your Issues</CardTitle>
              <Button variant='ghost' size='sm' className='text-blue-600'>
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {mockIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile */}
      <div className='sm:hidden'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <Button variant='outline' className='h-16 flex-col'>
                <Plus className='w-6 h-6 mb-1' />
                <span className='text-sm'>New Issue</span>
              </Button>
              <Button variant='outline' className='h-16 flex-col'>
                <FolderKanban className='w-6 h-6 mb-1' />
                <span className='text-sm'>New Project</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
