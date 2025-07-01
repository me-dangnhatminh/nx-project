'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
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
import { ProjectCard } from '../../../components/project/project-card';
import { Project, User } from '@shared/types/pmms';
// Mock data
const mockUser: User = {
  id: '1',
  name: 'Minh Dang',
  email: 'me-dangnhatminh@example.com',
  role: 'admin',
};

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    key: 'ECP',
    description:
      'Building a modern e-commerce platform with React and Node.js. This project includes user authentication, product catalog, shopping cart, and payment integration.',
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
    description:
      'Cross-platform mobile application using React Native for iOS and Android platforms.',
    type: 'software',
    lead: mockUser,
    category: 'Mobile',
    createdAt: '2025-02-01',
    updatedAt: '2025-06-29',
    status: 'active',
    members: [mockUser],
  },
  {
    id: '3',
    name: 'Website Redesign',
    key: 'WR',
    description: 'Complete redesign of the company website with modern UI/UX principles.',
    type: 'business',
    lead: mockUser,
    category: 'Design',
    createdAt: '2025-03-10',
    updatedAt: '2025-06-28',
    status: 'active',
    members: [mockUser],
  },
  {
    id: '4',
    name: 'Customer Support Portal',
    key: 'CSP',
    description: 'Internal portal for customer support team to manage tickets and knowledge base.',
    type: 'service_desk',
    lead: mockUser,
    category: 'Support',
    createdAt: '2025-04-05',
    updatedAt: '2025-06-27',
    status: 'archived',
    members: [mockUser],
  },
];

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || project.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

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

  return (
    <div className='p-4 sm:p-6 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Projects</h1>
          <p className='text-gray-600'>Manage and track all your projects</p>
        </div>
        <Button>
          <Plus className='w-4 h-4 mr-2' />
          <span className='hidden sm:inline'>Create Project</span>
          <span className='sm:hidden'>Create</span>
        </Button>
      </div>

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

      {/* Projects Grid/List */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6'
            : 'space-y-4'
        }
      >
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* No results */}
      {filteredProjects.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-500 mb-4'>No projects found matching your criteria.</p>
          <Button variant='outline'>
            <Plus className='w-4 h-4 mr-2' />
            Create your first project
          </Button>
        </div>
      )}

      {/* Results count */}
      <div className='text-sm text-gray-500 text-center sm:text-left'>
        Showing {filteredProjects.length} of {mockProjects.length} projects
      </div>
    </div>
  );
}
