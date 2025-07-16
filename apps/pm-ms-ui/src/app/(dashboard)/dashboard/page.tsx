'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  Filter,
  FolderKanban,
  Loader2,
} from 'lucide-react';
import { Button } from '@shadcn-ui/components/button';
import { Project, Issue, User } from '@shared/types/pmms';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn-ui/components/card';
import { ProjectCard } from '../../../components/project/project-card';
import { IssueCard } from '../../../components/issue/issue-card';
import { projectsApi } from 'apps/pm-ms-ui/src/lib/api/project';
import { toast } from 'sonner';

// Mock user (keep as requested)
const mockUser: User = {
  id: 'me-dangnhatminh',
  name: 'Minh Dang',
  email: 'me-dangnhatminh@example.com',
  avatar: '/avatar.png',
  role: 'admin',
};

// Mock issues (until issue API is implemented)
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
    loggedTime: 5,
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
    estimatedTime: 4,
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
  {
    id: '3',
    key: 'ECP-124',
    title: 'Design new dashboard layout',
    description: 'Create wireframes and mockups for the new dashboard',
    type: 'story',
    status: 'done',
    priority: 'medium',
    assignee: mockUser,
    reporter: mockUser,
    projectId: '1',
    labels: ['design', 'ui'],
    components: [],
    fixVersions: [],
    createdAt: '2025-06-20',
    updatedAt: '2025-07-01',
    dueDate: '2025-06-28',
    estimatedTime: 6,
    loggedTime: 6,
    attachments: [],
    comments: [],
  },
];

interface DashboardStats {
  activeProjects: number;
  assignedIssues: number;
  teamMembers: number;
  dueThisWeek: number;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    assignedIssues: 0,
    teamMembers: 0,
    dueThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Calculate date ranges
  const now = new Date('2025-07-08T03:03:22Z'); // Current date from user input
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  // Fetch real data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch projects (real API)
      const projectsResponse = await projectsApi.getProjects({
        limit: 50, // Get more projects for stats
        status: 'active',
      });

      setProjects(projectsResponse.data);

      // Calculate stats
      const activeProjectsCount = projectsResponse.data.filter((p) => p.status === 'active').length;

      // Mock calculations for issues until API is ready
      const assignedIssuesCount = mockIssues.filter(
        (issue) => issue.assignee?.id === mockUser.id && issue.status !== 'done',
      ).length;

      const dueThisWeekCount = mockIssues.filter((issue) => {
        if (!issue.dueDate) return false;
        const dueDate = new Date(issue.dueDate);
        return dueDate >= startOfWeek && dueDate <= endOfWeek && issue.status !== 'done';
      }).length;

      // Calculate total unique team members across all projects
      const allMembers = new Set<string>();
      projectsResponse.data.forEach((project) => {
        project.members?.forEach((member) => allMembers.add(member.id));
        if (project.lead) allMembers.add(project.lead.id);
      });

      setStats({
        activeProjects: activeProjectsCount,
        assignedIssues: assignedIssuesCount,
        teamMembers: allMembers.size,
        dueThisWeek: dueThisWeekCount,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Get recent projects (last 4 updated)
  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  // Get user's recent issues
  const userIssues = mockIssues
    .filter((issue) => issue.assignee?.id === mockUser.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const statCards = [
    {
      title: 'Active Projects',
      value: stats.activeProjects.toString(),
      icon: TrendingUp,
      change: '+2 from last month',
      color: 'text-blue-600',
    },
    {
      title: 'Assigned Issues',
      value: stats.assignedIssues.toString(),
      icon: CheckCircle,
      change: '+3 from last week',
      color: 'text-green-600',
    },
    {
      title: 'Team Members',
      value: stats.teamMembers.toString(),
      icon: Users,
      change: '+1 from last month',
      color: 'text-purple-600',
    },
    {
      title: 'Due This Week',
      value: stats.dueThisWeek.toString(),
      icon: Calendar,
      change: stats.dueThisWeek > 0 ? 'Action needed' : 'All caught up!',
      color: stats.dueThisWeek > 0 ? 'text-orange-600' : 'text-green-600',
    },
  ];

  if (loading) {
    return (
      <div className='p-4 sm:p-6 space-y-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='flex items-center space-x-2'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span className='text-gray-500'>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
          <p className='text-gray-600'>
            Welcome back, {mockUser.name}! Here&apos;s what&apos;s happening.
          </p>
          <p className='text-sm text-gray-500'>
            {now.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
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
        {statCards.map((stat) => (
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
              <Button
                variant='ghost'
                size='sm'
                className='text-blue-600'
                onClick={() => (window.location.href = '/projects')}
              >
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div
                  key={project.id}
                  className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-2 mb-2'>
                        <h3 className='font-medium text-gray-900'>{project.name}</h3>
                        <span className='text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded'>
                          {project.key}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            project.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                      {project.description && (
                        <p className='text-sm text-gray-600 line-clamp-2 mb-2'>
                          {project.description}
                        </p>
                      )}
                      <div className='flex items-center text-xs text-gray-500 space-x-4'>
                        <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                        <span>{project.memberCount || 0} members</span>
                        <span>{project.issueCount || 0} issues</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-8'>
                <p className='text-gray-500 mb-4'>No projects yet</p>
                <Button variant='outline' onClick={() => (window.location.href = '/projects')}>
                  <Plus className='w-4 h-4 mr-2' />
                  Create your first project
                </Button>
              </div>
            )}
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
            {userIssues.length > 0 ? (
              userIssues.map((issue) => (
                <div
                  key={issue.id}
                  className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded font-mono'>
                        {issue.key}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          issue.priority === 'highest'
                            ? 'bg-red-100 text-red-800'
                            : issue.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : issue.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {issue.priority}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          issue.status === 'done'
                            ? 'bg-green-100 text-green-800'
                            : issue.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : issue.status === 'in_review'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {issue.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        issue.type === 'bug'
                          ? 'bg-red-100 text-red-800'
                          : issue.type === 'story'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {issue.type}
                    </span>
                  </div>
                  <h4 className='font-medium text-gray-900 mb-2 line-clamp-2'>{issue.title}</h4>
                  <div className='flex items-center justify-between text-xs text-gray-500'>
                    <span>Updated {new Date(issue.updatedAt).toLocaleDateString()}</span>
                    {issue.dueDate && (
                      <span
                        className={
                          new Date(issue.dueDate) < now && issue.status !== 'done'
                            ? 'text-red-600 font-medium'
                            : ''
                        }
                      >
                        Due {new Date(issue.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-8'>
                <p className='text-gray-500 mb-4'>No issues assigned to you</p>
                <Button variant='outline'>
                  <Plus className='w-4 h-4 mr-2' />
                  Create an issue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Dashboard Sections */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Recent Activity */}
        <Card>
          <CardHeader className='pb-4'>
            <CardTitle className='text-lg'>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[
                {
                  action: 'updated',
                  target: 'ECP-123',
                  description: 'Implement user authentication system',
                  time: '2 hours ago',
                  type: 'issue',
                },
                {
                  action: 'created',
                  target: 'Mobile App',
                  description: 'New project for mobile application',
                  time: '1 day ago',
                  type: 'project',
                },
                {
                  action: 'completed',
                  target: 'ECP-124',
                  description: 'Design new dashboard layout',
                  time: '2 days ago',
                  type: 'issue',
                },
              ].map((activity, index) => (
                <div key={index} className='flex items-start space-x-3 text-sm'>
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'project'
                        ? 'bg-blue-500'
                        : activity.action === 'completed'
                        ? 'bg-green-500'
                        : 'bg-orange-500'
                    }`}
                  />
                  <div className='flex-1'>
                    <p className='text-gray-900'>
                      <span className='font-medium'>{activity.action}</span> {activity.target}
                    </p>
                    <p className='text-gray-500 text-xs'>{activity.description}</p>
                    <p className='text-gray-400 text-xs'>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className='pb-4'>
            <CardTitle className='text-lg'>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {mockIssues
                .filter((issue) => issue.dueDate && issue.status !== 'done')
                .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                .slice(0, 3)
                .map((issue) => {
                  const dueDate = new Date(issue.dueDate!);
                  const isOverdue = dueDate < now;
                  const daysUntilDue = Math.ceil(
                    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
                  );

                  return (
                    <div key={issue.id} className='flex items-center justify-between'>
                      <div className='flex-1'>
                        <p className='font-medium text-gray-900 line-clamp-1'>{issue.title}</p>
                        <p className='text-sm text-gray-500'>{issue.key}</p>
                      </div>
                      <div className='text-right'>
                        <p
                          className={`text-sm font-medium ${
                            isOverdue
                              ? 'text-red-600'
                              : daysUntilDue <= 1
                              ? 'text-orange-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {isOverdue
                            ? 'Overdue'
                            : daysUntilDue === 0
                            ? 'Today'
                            : daysUntilDue === 1
                            ? 'Tomorrow'
                            : `${daysUntilDue} days`}
                        </p>
                        <p className='text-xs text-gray-500'>{dueDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
              {mockIssues.filter((issue) => issue.dueDate && issue.status !== 'done').length ===
                0 && (
                <div className='text-center py-4'>
                  <p className='text-gray-500'>No upcoming deadlines</p>
                </div>
              )}
            </div>
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
              <Button
                variant='outline'
                className='h-16 flex-col'
                onClick={() => (window.location.href = '/projects')}
              >
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
