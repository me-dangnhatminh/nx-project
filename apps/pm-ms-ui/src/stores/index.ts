import { create } from 'zustand';

type Issue = any;

type IssueStore = {
  issues: Issue[];
  setIssues: (issues: Issue[]) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (issue: Issue) => void;
  deleteIssue: (issueId: string) => void;
};

export const useIssueStore = create<IssueStore>((set) => ({
  issues: [],
  setIssues: (issues) => set({ issues }),
  addIssue: (issue) => set((state) => ({ issues: [...state.issues, issue] })),
  updateIssue: (updatedIssue) =>
    set((state) => ({
      issues: state.issues.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)),
    })),
  deleteIssue: (issueId) =>
    set((state) => ({
      issues: state.issues.filter((issue) => issue.id !== issueId),
    })),
}));

//
type IssueStatus = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  sequence: number;
  projectId: string;
};

type StatusStore = {
  statuses: IssueStatus[];
  setStatuses: (statuses: IssueStatus[]) => void;
  addStatus: (status: IssueStatus) => void;
  updateStatus: (status: IssueStatus) => void;
  sortedStatuses: () => IssueStatus[];
  deleteStatus: (statusId: string) => void;
};

export const useStatusStore = create<StatusStore>((set, get) => ({
  statuses: [],
  setStatuses: (statuses) => set({ statuses }),
  addStatus: (status) => set((state) => ({ statuses: [...state.statuses, status] })),
  updateStatus: (updatedStatus) =>
    set((state) => ({
      statuses: state.statuses.map((status) =>
        status.id === updatedStatus.id ? updatedStatus : status,
      ),
    })),
  deleteStatus: (statusId) =>
    set((state) => ({
      statuses: state.statuses.filter((status) => status.id !== statusId),
    })),
  sortedStatuses: () => {
    const statuses = get().statuses;
    return statuses.slice().sort((a, b) => a.sequence - b.sequence);
  },
  sortStatus: () => {
    const statuses = get().statuses;
    const sorted = statuses.slice().sort((a, b) => a.sequence - b.sequence);
    set({ statuses: sorted });
  },
}));
