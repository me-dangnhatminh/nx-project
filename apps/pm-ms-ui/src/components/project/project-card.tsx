import Link from 'next/link';
import { MoreHorizontal, Star, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn-ui/components/avatar';
import { Badge } from '@shadcn-ui/components/badge';
import { Button } from '@shadcn-ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn-ui/components/dropdown-menu';
import { Project } from '@shared/types/pmms';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className='bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow'>
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center space-x-3'>
          <Avatar className='w-10 h-10'>
            <AvatarImage src={project.avatar} />
            <AvatarFallback>{project.key}</AvatarFallback>
          </Avatar>
          <div>
            <Link
              href={`/projects/${project.id}`}
              className='font-semibold text-gray-900 hover:text-blue-600'
            >
              {project.name}
            </Link>
            <p className='text-sm text-gray-500'>{project.key}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm'>
              <MoreHorizontal className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem>
              <Star className='w-4 h-4 mr-2' />
              Star project
            </DropdownMenuItem>
            <DropdownMenuItem>Edit project</DropdownMenuItem>
            <DropdownMenuItem className='text-red-600'>Archive project</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {project.description && (
        <p className='text-sm text-gray-600 mb-4 line-clamp-2'>{project.description}</p>
      )}

      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Badge variant='outline'>{project.type}</Badge>
          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
            {project.status}
          </Badge>
        </div>
        <div className='flex items-center space-x-2 text-sm text-gray-500'>
          <Users className='w-4 h-4' />
          <span>{project.members.length}</span>
        </div>
      </div>

      <div className='mt-4 pt-4 border-t border-gray-100'>
        <div className='flex items-center justify-between text-sm text-gray-500'>
          <span>Lead: {project.lead.name}</span>
          <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
