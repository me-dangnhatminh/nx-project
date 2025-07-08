'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Archive,
  ArchiveRestore,
  Users,
  Calendar,
  Globe,
  Hash,
  FolderOpen,
  UserIcon,
  Clock,
  MoreHorizontal,
  Settings,
  Plus,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Button } from '@shadcn-ui/components/button';
import { Badge } from '@shadcn-ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn-ui/components/card';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn-ui/components/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shadcn-ui/components/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shadcn-ui/components/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shadcn-ui/components/sheet';
import { Project, User } from '@shared/types/pmms';
import { projectsApi } from '../../../../lib/api/projects';
import EditProjectForm from '../edit-project-form';
import DeleteConfirmationDialog from './../delete-confirmation-dialog';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch project details
  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getProject(projectId);
      setProject(response);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project');
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleProjectUpdated = (updatedProject: Project) => {
    setProject(updatedProject);
    setIsEditSheetOpen(false);
    toast.success('Project updated successfully!');
  };

  const handleEditCancel = () => {
    setIsEditSheetOpen(false);
  };

  const handleArchiveProject = async () => {
    if (!project) return;

    try {
      if (project.status === 'active') {
        await projectsApi.archiveProject(project.id);
        setProject((prev) => (prev ? { ...prev, status: 'archived' } : null));
        toast.success('Project archived successfully!');
      } else {
        await projectsApi.unarchiveProject(project.id);
        setProject((prev) => (prev ? { ...prev, status: 'active' } : null));
        toast.success('Project restored successfully!');
      }
    } catch (error) {
      console.error('Error archiving/unarchiving project:', error);
      toast.error('Failed to update project status');
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    try {
      await projectsApi.deleteProject(project.id);
      toast.success('Project deleted successfully!');
      router.push('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);

      if (error.response?.status === 409) {
        const details = error.response.data.details;
        let message = 'Cannot delete project with associated data:';
        if (details.issues > 0) message += ` ${details.issues} issues,`;
        if (details.members > 1) message += ` ${details.members} members,`;
        if (details.sprints > 0) message += ` ${details.sprints} sprints,`;
        message = message.replace(/,$/, '');
        toast.error(message);
      } else {
        toast.error('Failed to delete project');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'software':
        return 'bg-blue-100 text-blue-800';
      case 'business':
        return 'bg-purple-100 text-purple-800';
      case 'service_desk':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className='p-4 sm:p-6 space-y-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='flex items-center space-x-2'>
            <Loader2 className='h-6 w-6 animate-spin' />
            <span className='text-gray-500'>Loading project...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className='p-4 sm:p-6 space-y-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>Project not found</h2>
            <p className='text-gray-500 mb-4'>The project you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/projects')}>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 sm:p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='outline' size='sm' onClick={() => router.push('/projects')}>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back
          </Button>
          <div className='flex items-center space-x-3'>
            {project.avatar ? (
              <Avatar className='h-10 w-10'>
                <AvatarImage src={project.avatar} alt={project.name} />
                <AvatarFallback>{getInitials(project.name)}</AvatarFallback>
              </Avatar>
            ) : (
              <div className='h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center'>
                <FolderOpen className='h-5 w-5 text-gray-500' />
              </div>
            )}
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>{project.name}</h1>
              <p className='text-sm text-gray-500'>{project.key}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex items-center space-x-2'>
          <Button variant='outline' size='sm' onClick={() => setIsEditSheetOpen(true)}>
            <Edit className='w-4 h-4 mr-2' />
            Edit
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                <MoreHorizontal className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setIsEditSheetOpen(true)}>
                <Edit className='mr-2 h-4 w-4' />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleArchiveProject}>
                {project.status === 'active' ? (
                  <>
                    <Archive className='mr-2 h-4 w-4' />
                    Archive Project
                  </>
                ) : (
                  <>
                    <ArchiveRestore className='mr-2 h-4 w-4' />
                    Restore Project
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className='text-red-600 focus:text-red-600'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Project Overview */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Project Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Hash className='w-5 h-5' />
                <span>Project Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex flex-wrap gap-2'>
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                <Badge className={getTypeColor(project.type)}>
                  {project.type.replace('_', ' ')}
                </Badge>
                <Badge variant='outline'>{project.category}</Badge>
              </div>

              {project.description && (
                <div>
                  <h4 className='font-medium text-gray-900 mb-2'>Description</h4>
                  <p className='text-gray-600 leading-relaxed'>{project.description}</p>
                </div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center space-x-2'>
                  <Calendar className='w-4 h-4 text-gray-500' />
                  <span className='text-sm text-gray-600'>
                    Created: {formatDate(project.createdAt)}
                  </span>
                </div>
                <div className='flex items-center space-x-2'>
                  <Clock className='w-4 h-4 text-gray-500' />
                  <span className='text-sm text-gray-600'>
                    Updated: {formatDate(project.updatedAt)}
                  </span>
                </div>
              </div>

              {project.url && (
                <div className='flex items-center space-x-2'>
                  <Globe className='w-4 h-4 text-gray-500' />
                  <a
                    href={project.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:text-blue-800 underline'
                  >
                    {project.url}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Details Tabs */}
          <Tabs defaultValue='overview' className='w-full'>
            <TabsList className='grid w-full grid-cols-4'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='issues'>Issues</TabsTrigger>
              <TabsTrigger value='activity'>Activity</TabsTrigger>
              <TabsTrigger value='settings'>Settings</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Project Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-gray-900'>
                        {project.issueCount || 0}
                      </div>
                      <div className='text-sm text-gray-500'>Issues</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-gray-900'>
                        {project.memberCount || 0}
                      </div>
                      <div className='text-sm text-gray-500'>Members</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-gray-900'>0</div>
                      <div className='text-sm text-gray-500'>Sprints</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-gray-900'>0</div>
                      <div className='text-sm text-gray-500'>Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='issues' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center py-8'>
                    <p className='text-gray-500 mb-4'>No issues yet</p>
                    <Button>
                      <Plus className='w-4 h-4 mr-2' />
                      Create Issue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='activity' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center py-8'>
                    <p className='text-gray-500'>No recent activity</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='settings' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Project Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <Button variant='outline' onClick={() => setIsEditSheetOpen(true)}>
                      <Settings className='w-4 h-4 mr-2' />
                      Edit Project Details
                    </Button>

                    <div className='pt-4 border-t'>
                      <h4 className='font-medium text-gray-900 mb-2'>Danger Zone</h4>
                      <p className='text-sm text-gray-600 mb-4'>
                        Once you delete a project, there is no going back. Please be certain.
                      </p>
                      <Button variant='destructive' onClick={() => setIsDeleteDialogOpen(true)}>
                        <Trash2 className='w-4 h-4 mr-2' />
                        Delete Project
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Project Lead */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <UserIcon className='w-5 h-5' />
                <span>Project Lead</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center space-x-3'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage src={project.lead.avatar} alt={project.lead.name} />
                  <AvatarFallback>{getInitials(project.lead.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-medium text-gray-900'>{project.lead.name}</p>
                  <p className='text-sm text-gray-500'>{project.lead.email}</p>
                  <Badge variant='outline' className='text-xs'>
                    {project.lead.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <Users className='w-5 h-5' />
                  <span>Team Members</span>
                </div>
                <Button variant='outline' size='sm'>
                  <Plus className='w-4 h-4 mr-2' />
                  Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {project.members && project.members.length > 0 ? (
                  project.members.map((member) => (
                    <div key={member.id} className='flex items-center space-x-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className='text-xs'>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-gray-900'>{member.name}</p>
                        <p className='text-xs text-gray-500'>{member.role}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-4'>
                    <p className='text-sm text-gray-500'>No team members yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button variant='outline' className='w-full justify-start'>
                <Plus className='w-4 h-4 mr-2' />
                Create Issue
              </Button>
              <Button variant='outline' className='w-full justify-start'>
                <Users className='w-4 h-4 mr-2' />
                Manage Members
              </Button>
              <Button variant='outline' className='w-full justify-start'>
                <Settings className='w-4 h-4 mr-2' />
                Project Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Project Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent
          side='right'
          className='w-full sm:max-w-[600px] lg:max-w-[800px] overflow-y-auto'
        >
          <SheetHeader>
            <SheetTitle>Edit Project</SheetTitle>
          </SheetHeader>
          <div className='mt-6'>
            <EditProjectForm
              project={project}
              onSuccess={handleProjectUpdated}
              onCancel={handleEditCancel}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteProject}
        title='Delete Project'
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will permanently remove the project and all associated data.`}
        confirmText={project.name}
        destructiveAction={true}
      />
    </div>
  );
}
