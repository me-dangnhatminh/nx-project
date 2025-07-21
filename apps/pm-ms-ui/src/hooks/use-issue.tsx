import { create } from 'zustand';
import React, { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { issueApi } from 'apps/pm-ms-ui/src/lib/api/issue';
import { CreateIssueInput, ReorderIssueInput } from 'apps/pm-ms-ui/src/lib/schemas/issue';
import { Issue, IssueStatus } from 'apps/pm-ms-ui/src/lib/types';
import { projectApi } from 'apps/pm-ms-ui/src/lib/api/project';
import {
  CreateIssueStatusInput,
  ReorderIssueStatusInput,
} from 'apps/pm-ms-ui/src/lib/schemas/issue-status';
import lexorank from '../lib/utils/lexorank';

const calculateNewOrder = (currentIssues: Issue[], input: ReorderIssueInput): Issue[] => {
  const { source, dest } = input;
  if (!source.ids || source.ids.length === 0) return currentIssues;

  const movingIssueIds = new Set(source.ids);
  const movingIssues = currentIssues.filter((issue) => movingIssueIds.has(issue.id));

  // ✅ KHÔNG filter remainingIssues - giữ nguyên tất cả issues không move
  const remainingIssues = currentIssues.filter((issue) => !movingIssueIds.has(issue.id));

  // ✅ Chỉ filter để tìm vị trí insert trong target status
  let targetStatusIssues: Issue[] = [];
  if (dest.statusId) {
    targetStatusIssues = remainingIssues.filter((issue) => issue.statusId === dest.statusId);
  } else {
    // Nếu không có statusId, target là toàn bộ remaining issues
    targetStatusIssues = remainingIssues;
  }

  let insertPosition = targetStatusIssues.length; // Default: cuối danh sách

  // ✅ Tính vị trí insert dựa trên targetStatusIssues
  if (dest.destType === 'after' && dest.destParam) {
    const destIndex = targetStatusIssues.findIndex((issue) => issue.id === dest.destParam);
    if (destIndex === -1) {
      throw new Error('Destination issue not found or is being moved');
    }
    insertPosition = destIndex + 1;
  } else if (dest.destType === 'before' && dest.destParam) {
    const destIndex = targetStatusIssues.findIndex((issue) => issue.id === dest.destParam);
    if (destIndex === -1) {
      throw new Error('Destination issue not found or is being moved');
    }
    insertPosition = destIndex;
  }

  // ✅ Cập nhật statusId cho moving issues nếu cần
  const updatedMovingIssues = movingIssues.map((issue) =>
    dest.statusId ? { ...issue, statusId: dest.statusId } : issue,
  );

  // ✅ Tính rank mới cho moving issues
  const issuesWithNewRanks = updatedMovingIssues.map((issue, moveIndex) => {
    let newRank: string;

    if (targetStatusIssues.length === 0) {
      // Target status trống
      newRank =
        moveIndex === 0
          ? lexorank.middle()
          : lexorank.between(updatedMovingIssues[moveIndex - 1].rank, lexorank.max());
    } else if (insertPosition === 0) {
      // Insert ở đầu
      const nextRank = targetStatusIssues[0].rank;
      newRank =
        moveIndex === 0
          ? lexorank.between(lexorank.min(), nextRank)
          : lexorank.between(issuesWithNewRanks[moveIndex - 1].rank, nextRank);
    } else if (insertPosition >= targetStatusIssues.length) {
      // Insert ở cuối
      const prevRank = targetStatusIssues[targetStatusIssues.length - 1].rank;
      newRank =
        moveIndex === 0
          ? lexorank.between(prevRank, lexorank.max())
          : lexorank.between(issuesWithNewRanks[moveIndex - 1].rank, lexorank.max());
    } else {
      // Insert ở giữa
      const prevRank = targetStatusIssues[insertPosition - 1].rank;
      const nextRank = targetStatusIssues[insertPosition].rank;
      newRank =
        moveIndex === 0
          ? lexorank.between(prevRank, nextRank)
          : lexorank.between(issuesWithNewRanks[moveIndex - 1].rank, nextRank);
    }

    return { ...issue, rank: newRank };
  });
  return [...remainingIssues, ...issuesWithNewRanks];
};

// =============================

type SetIssues = React.Dispatch<React.SetStateAction<Issue[]>>;
type SetIssueStatuses = React.Dispatch<React.SetStateAction<IssueStatus[]>>;
const useProjectIssuesStores = create<{
  issues: Issue[];
  setIssues: SetIssues;
  issueStatuses: IssueStatus[];
  setIssueStatuses: SetIssueStatuses;
}>((set) => ({
  issues: [],
  setIssues: (update) => {
    if (typeof update === 'function') set((state) => ({ issues: update(state.issues) }));
    else set({ issues: update });
  },
  issueStatuses: [],
  setIssueStatuses: (update) => {
    if (typeof update === 'function')
      set((state) => ({ issueStatuses: update(state.issueStatuses) }));
    else set({ issueStatuses: update });
  },
}));

export const useIssues = (
  params: { projectId: string; statusId?: string },
  config?: { enabled?: boolean },
) => {
  const { projectId } = params;
  const { issues, setIssues } = useProjectIssuesStores();

  const fetchIssues = useQuery({
    enabled: config?.enabled,
    queryKey: [projectId, 'issues', params],
    queryFn: async () => {
      const res = await issueApi.list(projectId);
      setIssues(res.items);
      return res;
    },
    staleTime: 1000 * 10,
  });

  const createIssue = useMutation({
    mutationFn: async (input: CreateIssueInput) => {
      const data = await issueApi.create(projectId, input);
      return data;
    },
    onSuccess: () => {
      fetchIssues.refetch();
    },
  });

  const filteredIssues = useMemo(() => {
    const sortedIssues = issues.sort((a, b) => {
      if (a.rank < b.rank) return -1;
      if (a.rank > b.rank) return 1;
      return 0;
    });
    if (!params?.statusId) return sortedIssues;
    return sortedIssues.filter((issue) => {
      return issue.statusId === params.statusId;
    });
  }, [issues, params?.statusId]);

  const reorderIssue = useMutation({
    mutationFn: (input: ReorderIssueInput) => {
      return issueApi.reorder(projectId, input);
    },
    onMutate: (input) => {
      const previousIssues = structuredClone(issues);
      if (!input.source.ids || input.source.ids.length === 0) {
        return { previous: previousIssues };
      }

      try {
        const newOrder = calculateNewOrder(previousIssues, input);
        setIssues(newOrder);
        return { previous: previousIssues };
      } catch (error) {
        console.error('Error calculating new order:', error);
        return { previous: previousIssues };
      }
    },
    onError: (error, _input, context) => {
      if (context?.previous) setIssues(context.previous);
      console.error('Failed to reorder issues:', error);
    },
  });

  return {
    issues: filteredIssues,
    setIssues,
    fetchIssues,
    reorderIssue,
    createIssue,
  };
};

export const useIssue = (issueId: string) => {
  throw new Error('useIssue is not implemented yet');
};

// ============= Issue Types, Statuses, and Priorities =============
export const useIssueTypes = (projectId: string, config?: { enabled?: boolean }) => {
  const fetchIssueTypes = useQuery({
    ...config,
    queryKey: ['issueTypes', projectId],
    queryFn: () => projectApi.issueTypeList(projectId),
  });

  const issueTypes = useMemo(() => {
    return fetchIssueTypes.data?.items || [];
  }, [fetchIssueTypes.data]);

  return { issueTypes, fetchIssueTypes };
};

export const useIssueStatues = (projectId: string, config?: { enabled?: boolean }) => {
  const { issueStatuses, setIssueStatuses } = useProjectIssuesStores();

  const fetchIssueStatuses = useQuery({
    ...config,
    queryKey: ['issueStatuses', projectId],
    queryFn: async () => {
      const data = await issueApi.statusList(projectId);
      setIssueStatuses(data.items);
      return data;
    },
  });

  const createIssueStatus = useMutation({
    mutationFn: async (input: CreateIssueStatusInput) => {
      const data = await issueApi.statusCreate(projectId, input);
      return data;
    },
    onSuccess: () => {
      fetchIssueStatuses.refetch();
    },
  });

  const calculateNewOrder = useCallback(
    (currentStatuses: IssueStatus[], input: ReorderIssueStatusInput): IssueStatus[] => {
      const { source, dest } = input;
      if (!source || source.length === 0) return currentStatuses;

      // Tìm các statuses đang được move
      const movingStatusIds = new Set(source.map((s) => s.id));
      const movingStatuses = currentStatuses.filter((s) => movingStatusIds.has(s.id));

      // Lọc ra các statuses không được move
      const remainingStatuses = currentStatuses.filter((s) => !movingStatusIds.has(s.id));

      let finalOrder: IssueStatus[];

      if (!dest?.destType) {
        // Không có destType = thêm vào cuối
        finalOrder = [...remainingStatuses, ...movingStatuses];
      } else if (dest.destType === 'after') {
        // Chèn sau status cụ thể
        if (!dest.destParam) {
          throw new Error('Destination parameter required for "after" operation');
        }

        const destIndex = remainingStatuses.findIndex((s) => s.id === dest.destParam);
        if (destIndex === -1) {
          throw new Error('Destination status not found or is being moved');
        }

        finalOrder = [
          ...remainingStatuses.slice(0, destIndex + 1), // trước + destination
          ...movingStatuses, // statuses được chèn
          ...remainingStatuses.slice(destIndex + 1), // sau destination
        ];
      } else if (dest.destType === 'before') {
        // Chèn trước status cụ thể
        if (!dest.destParam) {
          throw new Error('Destination parameter required for "before" operation');
        }

        const destIndex = remainingStatuses.findIndex((s) => s.id === dest.destParam);
        if (destIndex === -1) {
          throw new Error('Destination status not found or is being moved');
        }

        finalOrder = [
          ...remainingStatuses.slice(0, destIndex),
          ...movingStatuses,
          ...remainingStatuses.slice(destIndex),
        ];
      } else {
        throw new Error('Invalid destination type');
      }

      return finalOrder.map((status, index) => ({ ...status, sequence: index }));
    },
    [issueStatuses, setIssueStatuses],
  );

  const reorderIssueStatus = useMutation({
    mutationFn: (input: ReorderIssueStatusInput) => {
      return issueApi.statusReorder(projectId, input);
    },
    onMutate: (input) => {
      const previousStatuses = structuredClone(issueStatuses);
      if (!input.source || input.source.length === 0) return { previous: previousStatuses };
      try {
        const newOrder = calculateNewOrder(previousStatuses, input);
        setIssueStatuses(newOrder);
        return { previous: previousStatuses };
      } catch (error) {
        console.error('Error calculating new order:', error);
        return { previous: previousStatuses };
      }
    },
    onSuccess: (data, variables, context) => {
      fetchIssueStatuses.refetch();
    },
    onError: (error, input, context) => {
      if (context?.previous) setIssueStatuses(context.previous);
      console.error('Failed to reorder statuses:', error);
    },
  });

  return { issueStatuses, fetchIssueStatuses, createIssueStatus, reorderIssueStatus };
};

export const useIssuePriorities = (projectId: string, config?: { enabled?: boolean }) => {
  const fetchIssuePriorities = useQuery({
    ...config,
    queryKey: ['issuePriorities', projectId],
    queryFn: () => issueApi.priorityList(projectId),
  });

  const issuePriorities = useMemo(() => {
    return fetchIssuePriorities.data?.items || [];
  }, [fetchIssuePriorities.data]);

  return { issuePriorities, fetchIssuePriorities };
};
