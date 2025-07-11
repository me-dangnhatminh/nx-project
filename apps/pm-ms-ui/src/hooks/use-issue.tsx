import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

export const useFetchIssues = (
  projectId: string,
  viewType: 'kanban' | 'list' | 'calendar' | 'gantt' | 'timeline',
) => {
  if (viewType !== 'list') throw new Error('Invalid view type for useFetchIssues hook');

  return useQuery({
    queryKey: ['issues', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/issues?viewType=${viewType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch issues');
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
  });
};

interface CreateIssueData {
  key: string;
  summary: string;
  description?: string;
  typeId: string;
  statusId: string;
  priorityId: string;
  projectId: string;
  reporterId?: string;
  assigneeId?: string;
  dueDate?: string;
}

interface UpdateIssueData {
  summary?: string;
  description?: string;
  statusId?: string;
  priorityId?: string;
  assigneeId?: string;
  dueDate?: string;
}

export const useIssueAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createIssue = useCallback(async (data: CreateIssueData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create issue');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIssue = useCallback(async (id: string, data: UpdateIssueData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/issues/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update issue');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIssue = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/issues/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete issue');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getIssues = useCallback(
    async (
      params: {
        projectId?: string;
        statusId?: string;
        assigneeId?: string;
        page?: number;
        limit?: number;
      } = {},
    ) => {
      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, value.toString());
          }
        });

        const response = await fetch(`/api/issues?${searchParams}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch issues');
        }

        return result.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    createIssue,
    updateIssue,
    deleteIssue,
    getIssues,
    loading,
    error,
  };
};
