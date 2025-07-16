import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { issueApi } from 'apps/pm-ms-ui/src/lib/api/issue';
import { CreateIssueInput } from 'apps/pm-ms-ui/src/lib/schemas/issue';
import { Issue } from 'apps/pm-ms-ui/src/lib/types';

export const useProjectIssue = (projectId: string, params: { statusId: string }) => {
  const [issues, setIssues] = useState<Issue[]>([]);

  const fetchIssues = useQuery({
    queryKey: [projectId, 'issues', params],
    queryFn: async () => {
      return await issueApi.getByStatus(projectId, params.statusId);
    },
  });

  const createIssue = useMutation({
    mutationFn: (input: CreateIssueInput) => {
      return issueApi.create(input);
    },
    onSuccess: () => {
      fetchIssues.refetch();
    },
  });

  useEffect(() => {
    if (fetchIssues.data) {
      const items = fetchIssues.data?.items;
      setIssues(items || []);
    }
  }, [fetchIssues.data]);

  return {
    issues,
    setIssues,
    fetchIssues,
    createIssue,
  };
};
