import { ProjectCreateForm } from './project-create-form';

export default function Page() {
  return (
    <section className='w-full h-full'>
      <div className='flex items-center justify-between p-4 sm:p-6 lg:p-8'>
        <h1 className='text-2xl font-bold tracking-wide'>Create New Project</h1>
      </div>
      <div className='p-4 sm:p-6 lg:p-8'>
        <ProjectCreateForm />
      </div>
    </section>
  );
}
