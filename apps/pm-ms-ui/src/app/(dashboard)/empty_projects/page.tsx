'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  Loader2,
  RefreshCw,
  Edit,
  Archive,
  ArchiveRestore,
  Trash2,
} from 'lucide-react';
import { Button } from '@shadcn-ui/components/button';
import { Input } from '@shadcn-ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn-ui/components/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@shadcn-ui/components/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shadcn-ui/components/dropdown-menu';
import { ProjectCard } from '../../../components/project/project-card';
import CreateProjectForm from './create-project-form';
import EditProjectForm from './edit-project-form';
import { Project, User } from '@shared/types/pmms';
import { projectsApi } from 'apps/pm-ms-ui/src/lib/api/project';
import { toast } from 'sonner';
import { MoreHorizontal } from 'lucide-react';
import DeleteConfirmationDialog from './delete-confirmation-dialog';

// Mock user (keep as requested)
const mockUser: User = {
  id: 'me-dangnhatminh',
  name: 'Minh Dang',
  email: 'me-dangnhatminh@example.com',
  role: 'admin',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Fetch projects
  const fetchProjects = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await projectsApi.getProjects({
        page: pagination.page,
        limit: pagination.limit,
        type: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchTerm || undefined,
      });

      setProjects(response.data);
      setPagination(response.pagination);

      console.log('Fetched projects:', response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh projects
  const refreshProjects = () => {
    fetchProjects(false);
  };

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Load projects when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 300);

    return () => clearTimeout(timer);
  }, [pagination.page, selectedType, selectedStatus]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else {
        fetchProjects();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
    setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
    setIsCreateSheetOpen(false);
    toast.success('Project created successfully!');
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setIsEditSheetOpen(false);
    setSelectedProject(null);
    toast.success('Project updated successfully!');
  };

  const handleCreateCancel = () => {
    setIsCreateSheetOpen(false);
  };

  const handleEditCancel = () => {
    setIsEditSheetOpen(false);
    setSelectedProject(null);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditSheetOpen(true);
  };

  const handleArchiveProject = async (project: Project) => {
    try {
      if (project.status === 'active') {
        await projectsApi.archiveProject(project.id);
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, status: 'archived' } : p)),
        );
        toast.success('Project archived successfully!');
      } else {
        await projectsApi.unarchiveProject(project.id);
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, status: 'active' } : p)),
        );
        toast.success('Project restored successfully!');
      }
    } catch (error) {
      console.error('Error archiving/unarchiving project:', error);
      toast.error('Failed to update project status');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const FilterContent = () => (
    <>
      <Select value={selectedType} onValueChange={setSelectedType}>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Project type' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Types</SelectItem>
          <SelectItem value='software'>Software</SelectItem>
          <SelectItem value='business'>Business</SelectItem>
          <SelectItem value='service_desk'>Service Desk</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          <SelectItem value='active'>Active</SelectItem>
          <SelectItem value='archived'>Archived</SelectItem>
        </SelectContent>
      </Select>
    </>
  );

  // Add this to your existing ProjectActions component in the projects page

  const ProjectActions = ({ project }: { project: Project }) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleDeleteProject = async () => {
      try {
        await projectsApi.deleteProject(project.id);
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
        toast.success('Project deleted successfully!');
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

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEditProject(project)}>
              <Edit className='mr-2 h-4 w-4' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleArchiveProject(project)}>
              {project.status === 'active' ? (
                <>
                  <Archive className='mr-2 h-4 w-4' />
                  Archive
                </>
              ) : (
                <>
                  <ArchiveRestore className='mr-2 h-4 w-4' />
                  Restore
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className='text-red-600 focus:text-red-600'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
      </>
    );
  };

  return (
    <div className='p-4 sm:p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Projects</h1>
            <p className='text-gray-600'>Manage and track all your projects</p>
          </div>
          <Button variant='outline' size='sm' onClick={refreshProjects} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Create Project Sheet */}
        <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className='w-4 h-4 mr-2' />
              <span className='hidden sm:inline'>Create Project</span>
              <span className='sm:hidden'>Create</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side='right'
            className='w-full sm:max-w-[600px] lg:max-w-[800px] overflow-y-auto'
          >
            <SheetHeader>
              <SheetTitle>Create New Project</SheetTitle>
            </SheetHeader>
            <div className='mt-6'>
              <CreateProjectForm onSuccess={handleProjectCreated} onCancel={handleCreateCancel} />
            </div>
          </SheetContent>
        </Sheet>
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
            {selectedProject && (
              <EditProjectForm
                project={selectedProject}
                onSuccess={handleProjectUpdated}
                onCancel={handleEditCancel}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Search and Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        {/* Search */}
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            placeholder='Search projects...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Desktop Filters */}
        <div className='hidden lg:flex items-center space-x-4'>
          <div className='flex space-x-2'>
            <FilterContent />
          </div>
        </div>

        {/* Mobile Filter Button */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant='outline' className='lg:hidden'>
              <SlidersHorizontal className='w-4 h-4 mr-2' />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side='right' className='w-80'>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className='space-y-4 mt-6'>
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>

        {/* View Mode Toggle */}
        <div className='flex items-center space-x-2'>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode('grid')}
          >
            <Grid className='w-4 h-4' />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size='sm'
            onClick={() => setViewMode('list')}
          >
            <List className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Loading overlay for refresh */}
      {refreshing && (
        <div className='fixed inset-0 bg-black/20 flex items-center justify-center z-50'>
          <div className='bg-white p-4 rounded-lg shadow-lg flex items-center space-x-2'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Refreshing projects...</span>
          </div>
        </div>
      )}

      {/* Projects Grid/List */}
      {projects.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6'
              : 'space-y-4'
          }
        >
          {projects.map((project) => (
            <div key={project.id} className='relative group'>
              <ProjectCard project={project} />
              <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                <ProjectActions project={project} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* No results */
        <div className='text-center py-12'>
          <div className='max-w-md mx-auto'>
            <div className='text-6xl mb-4'>📁</div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'No projects found'
                : 'No projects yet'}
            </h3>
            <p className='text-gray-500 mb-6'>
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first project.'}
            </p>
            <div className='flex flex-col sm:flex-row gap-2 justify-center'>
              {(searchTerm || selectedType !== 'all' || selectedStatus !== 'all') && (
                <Button
                  variant='outline'
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                    setSelectedStatus('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
              <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
                <SheetTrigger asChild>
                  <Button>
                    <Plus className='w-4 h-4 mr-2' />
                    Create your first project
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side='right'
                  className='w-full sm:max-w-[600px] lg:max-w-[800px] overflow-y-auto'
                >
                  <SheetHeader>
                    <SheetTitle>Create New Project</SheetTitle>
                  </SheetHeader>
                  <div className='mt-6'>
                    <CreateProjectForm
                      onSuccess={handleProjectCreated}
                      onCancel={handleCreateCancel}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      )}

      {/* Pagination & Results count */}
      {projects.length > 0 && (
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t'>
          <div className='text-sm text-gray-500'>
            Showing {projects.length} of {pagination.total} projects
            {(searchTerm || selectedType !== 'all' || selectedStatus !== 'all') && (
              <span className='ml-1'>
                ({searchTerm && `"${searchTerm}"`}
                {selectedType !== 'all' && ` type: ${selectedType}`}
                {selectedStatus !== 'all' && ` status: ${selectedStatus}`})
              </span>
            )}
          </div>

          {pagination.pages > 1 && (
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className='text-sm text-gray-500 px-2'>
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
