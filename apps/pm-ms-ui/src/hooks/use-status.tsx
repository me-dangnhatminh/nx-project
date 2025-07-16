import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { statusApi } from 'apps/pm-ms-ui/src/lib/api/status';
import { CreateStatusInput } from 'apps/pm-ms-ui/src/lib/schemas/status';

export type IssueStatus = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  sequence?: number;
  projectId: string;
};

export type StatusStore = {
  statuses: IssueStatus[];
  setStatuses: (statuses: IssueStatus[]) => void;
  addStatus: (status: IssueStatus) => void;
  updateStatus: (status: IssueStatus) => void;
  sortedStatuses: () => IssueStatus[];
  deleteStatus: (statusId: string) => void;
  reorder: (sources: number[], destination: number) => void;
};

export const useProjectStatus = (projectId: string) => {
  const [statuses, setStatuses] = useState<IssueStatus[]>([]);

  const fetchStatuses = useQuery({
    queryKey: [projectId, 'statuses'],
    queryFn: async () => statusApi.list(projectId),
  });

  const createStatus = useMutation({
    mutationFn: (statusData: CreateStatusInput) => {
      return statusApi.create(projectId, statusData);
    },
    onSuccess: () => {
      fetchStatuses.refetch();
    },
  });

  const reorderStatus = useMutation({
    mutationFn: (input: { status: { id: string; sequence: number } }) => {
      return statusApi.reorder(projectId, input);
    },
    onMutate: (input) => {
      const previous = structuredClone(statuses);
      const newStatuses = structuredClone(statuses);
      const index = newStatuses.findIndex((s) => s.id === input.status.id);
      if (index === -1) throw new Error('Status not found for reordering');
      const data = newStatuses[index];
      if (!data) throw new Error('Status data not found for reordering');
      newStatuses.splice(index, 1);
      newStatuses.splice(input.status.sequence - 1, 0, data);
      setStatuses(newStatuses);
      return { previousStatuses: previous };
    },
    onError: (error, input, context) => {
      if (context?.previousStatuses) setStatuses(context.previousStatuses);
    },
  });

  const deleteStatus = useMutation({
    mutationFn: (statusId: string) => {
      return statusApi.delete(projectId, statusId);
    },
    onSuccess: (input: string) => {
      setStatuses((prev) => prev.filter((status) => status.id !== input));
    },
  });

  const renameStatus = useMutation({
    mutationFn: (input: { statusId: string; name: string }) => {
      return statusApi.update(projectId, input.statusId, { name: input.name });
    },
    onSuccess: (data, variables) => {
      setStatuses((prev) =>
        prev.map((status) =>
          status.id === variables.statusId ? { ...status, name: data.name } : status,
        ),
      );
    },
  });

  useEffect(() => {
    if (fetchStatuses.isSuccess && fetchStatuses.data) {
      setStatuses(fetchStatuses.data.items);
    }
  }, [fetchStatuses.data, fetchStatuses.isSuccess, setStatuses]);

  return {
    statuses,
    fetchStatuses,
    reorderStatus,
    createStatus,
    deleteStatus,
    renameStatus,
  };
};

// const renameStatus = useMutation({
//   mutationFn: async ({ columnId, name }: { columnId: string; name: string }) => {
//     return statusApi.update(projectId, columnId, { name });
//   },
//   onSuccess: (_data, { columnId, name }) => {
//     onColumnRename?.(columnId, name);
//     setColumnAction(null);
//   },
//   onError: (error) => {
//     toast.error(`Failed to rename column: ${error.message}`);
//     setColumnAction(null);
//   },
// });

// const deleteStatus = useMutation({
//   mutationFn: async (columnId: string) => {
//     return statusApi.delete(projectId, columnId);
//   },
//   onSuccess: () => {
//     onColumnDelete?.(column.id);
//     setColumnAction(null);
//   },
//   onError: (error) => {
//     toast.error(`Failed to delete column: ${error.message}`);
//     setColumnAction(null);
//   },
// });
