'use server';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || typeof id !== 'string') throw new Error('Project ID is required');
  return <div className='w-full h-full'>Welcome to the project {id} board page.</div>;
}
