import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useEffect, useMemo, useState } from 'react';
import { issueApi } from 'apps/pm-ms-ui/src/lib/api/issue';
import { CreateIssueInput } from 'apps/pm-ms-ui/src/lib/schemas/issue';
import { Issue } from 'apps/pm-ms-ui/src/lib/types';
import { create } from 'zustand';

type SetIssues = React.Dispatch<React.SetStateAction<Issue[]>>;
const useProjectIssuesStores = create<{
  issues: Issue[];
  setIssues: SetIssues;
}>((set) => ({
  issues: [],
  setIssues: (update) => {
    if (typeof update === 'function') set((state) => ({ issues: update(state.issues) }));
    else set({ issues: update });
  },
}));

export const useProjectIssues = (
  projectId: string,
  params?: { statusId?: string },
  config?: { enabled?: boolean },
) => {
  const { issues, setIssues } = useProjectIssuesStores();

  const fetchIssues = useQuery({
    enabled: config?.enabled,
    queryKey: [projectId, 'issues', params],
    queryFn: async () => {
      const res = await issueApi.list(projectId, params);
      setIssues((prev) => {
        const map = new Map(prev.map((i) => [i.id, i]));
        for (const issue of res.items) map.set(issue.id, issue);
        return Array.from(map.values());
      });
      return res;
    },
    staleTime: 1000 * 10,
  });

  const createIssue = useMutation({
    mutationFn: (input: CreateIssueInput) => {
      return issueApi.create(input);
    },
    onSuccess: () => {
      fetchIssues.refetch();
    },
  });

  const filteredIssues = useMemo(() => {
    if (params?.statusId) {
      return issues.filter((issue) => issue.statusId === params.statusId);
    }
    return issues;
  }, [issues, params?.statusId]);

  return {
    issues: filteredIssues,
    setIssues,
    fetchIssues,
    createIssue,
  };
};

export const useIssue = (issueId: string) => {
  throw new Error('useIssue is not implemented yet');
};
