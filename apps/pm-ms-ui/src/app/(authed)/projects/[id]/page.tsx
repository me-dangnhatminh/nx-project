'use server';

import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || typeof id !== 'string') throw new Error('Project ID is required');
  redirect(`/projects/${id}/summary`);
}
