import { PageContainer } from './page-container';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  if (!id || typeof id !== 'string') throw new Error('Project ID is required');
  return <PageContainer projectId={id} />;
}
