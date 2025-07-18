import { UpdateIssueStatusInput } from 'apps/pm-ms-ui/src/lib/schemas/status';
import { axiosInstance } from './_base';

type IssueRes = {
  items: {
    id: string;
    name: string;
    description?: string;
    color?: string;
    sequence?: number;
    projectId: string;
  }[];
  total: number;
};

const listStatuses = async (projectId: string) => {
  const response = await axiosInstance.get(`/projects/${projectId}/statuses`);
  const data = response.data?.data || response.data;
  return data as IssueRes;
};

const createStatus = async (
  projectId: string,
  statusData: { name: string; description?: string; color?: string },
) => {
  const response = await axiosInstance.post(`/projects/${projectId}/statuses`, statusData);
  return response.data?.data || response.data;
};

const deleteStatus = async (projectId: string, statusId: string) => {
  const response = await axiosInstance.delete(`/projects/${projectId}/statuses/${statusId}`);
  return response.data?.data || response.data;
};

const reorderStatuses = async (
  projectId: string,
  input: { status: { id: string; sequence: number } },
) => {
  const response = await axiosInstance.patch(`/projects/${projectId}/statuses/reorder`, input);
  return response.data?.data || response.data;
};

const updateStatus = async (projectId: string, statusId: string, input: UpdateIssueStatusInput) => {
  const url = `/projects/${projectId}/statuses/${statusId}`;
  const response = await axiosInstance.patch(url, input);
  return response.data?.data || response.data;
};

export const statusApi = {
  list: listStatuses,
  create: createStatus,
  delete: deleteStatus,
  reorder: reorderStatuses,
  update: updateStatus,
};
