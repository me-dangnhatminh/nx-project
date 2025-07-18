import { useMutation, useQuery } from '@tanstack/react-query';
import { statusApi } from 'apps/pm-ms-ui/src/lib/api/status';
import { CreateIssueStatusInput } from 'apps/pm-ms-ui/src/lib/schemas/status';
import { create } from 'zustand';

export type IssueStatus = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  sequence?: number;
  projectId: string;
};

type SetStatuses = React.Dispatch<React.SetStateAction<IssueStatus[]>>;
type StatusStore = {
  statuses: IssueStatus[];
  setStatuses: SetStatuses;
};

const useStatusStore = create<StatusStore>((set) => ({
  statuses: [],
  setStatuses: (update) => {
    if (typeof update === 'function') set((state) => ({ statuses: update(state.statuses) }));
    else set({ statuses: update });
  },
}));

export const useProjectStatus = (statusId: string) => {
  throw new Error('useProjectStatus is not implemented yet');
};

export const useProjectStatuses = (projectId: string) => {
  const statuses = useStatusStore((state) => state.statuses);
  const setStatuses = useStatusStore((state) => state.setStatuses);

  const fetchStatuses = useQuery({
    queryKey: [projectId, 'statuses'],
    queryFn: async () => {
      const data = await statusApi.list(projectId);
      setStatuses(data.items);
      return data;
    },
  });

  const createStatus = useMutation({
    mutationFn: (statusData: CreateIssueStatusInput) => {
      return statusApi.create(projectId, statusData);
    },
    onSuccess: () => {
      fetchStatuses.refetch();
    },
  });

  const reorderStatus = useMutation({
    mutationFn: (input: { statusId: string; sequence: number }) => {
      return statusApi.update(projectId, input.statusId, { sequence: input.sequence });
    },
    onMutate: (input) => {
      const previous = structuredClone(statuses);
      const newStatuses = structuredClone(statuses);
      const index = newStatuses.findIndex((s) => s.id === input.statusId);
      if (index === -1) throw new Error('Status not found for reordering');
      const data = newStatuses[index];
      if (!data) throw new Error('Status data not found for reordering');
      newStatuses.splice(index, 1);
      newStatuses.splice(input.sequence - 1, 0, data);
      newStatuses.forEach((status, idx) => (status.sequence = idx + 1));
      console.log('old: ', previous);
      console.log('new: ', newStatuses);
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

  return {
    statuses,
    fetchStatuses,
    reorderStatus,
    createStatus,
    deleteStatus,
    renameStatus,
  };
};
