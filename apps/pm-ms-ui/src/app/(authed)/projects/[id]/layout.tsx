import Link from 'next/link';
import { PropsWithChildren, useMemo } from 'react';
import {
  // Summarize, không có
  // Board, // không có
  // Members, không có
  // Summary, không có
  // tìm kiếm các icon tương ứng từ lucide-react
  List,
  Calendar,
  Users,
  LucideIcon,
} from 'lucide-react';

type ProjectNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const projectNavigationItems: ProjectNavigationItem[] = [
  {
    label: 'Summary',
    href: '/projects/{id}/summary',
    icon: List,
  },
  {
    label: 'Board',
    href: '/projects/{id}/board',
    icon: List,
  },
  { label: 'List', href: '/projects/{id}/list', icon: List },
  {
    label: 'Calendar',
    href: '/projects/{id}/calendar',
    icon: Calendar,
  },
  {
    label: 'Members',
    href: '/projects/{id}/members',
    icon: Users,
  },
];

export default async function ProjectLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id: projectId } = await params;

  const navItems = projectNavigationItems.map((item) => ({
    ...item,
    href: item.href.replace('{id}', projectId),
  }));

  return (
    <section className='w-full h-full relative'>
      <div id='project-detail-content' className='p-4 sm:p-6 lg:p-8 flex flex-row gap-4'>
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className='flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900'
          >
            <item.icon className='h-4 w-4' />
            {item.label}
          </Link>
        ))}
      </div>

      <div>{children}</div>
    </section>
  );
}
