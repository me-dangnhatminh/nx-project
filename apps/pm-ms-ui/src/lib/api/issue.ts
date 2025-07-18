import { axiosInstance } from './_base';
import { CreateIssueInput } from 'apps/pm-ms-ui/src/lib/schemas/issue';

const issueCreate = async (input: CreateIssueInput) => {
  const response = await axiosInstance.post(`projects/${input.projectId}/issues`, input);
  return response.data?.data || response.data;
};
const issueUpdate = async (id: string, input: CreateIssueInput) => {
  const response = await axiosInstance.put(`projects/${input.projectId}/issues/${id}`, input);
  return response.data?.data || response.data;
};
const issueDelete = async (projectId: string, issueId: string) => {
  const response = await axiosInstance.delete(`projects/${projectId}/issues/${issueId}`);
  return response.data?.data || response.data;
};
const issueGetDetail = async (projectId: string, issueId: string) => {
  const response = await axiosInstance.get(`projects/${projectId}/issues/${issueId}`);
  return response.data?.data || response.data;
};
const getByStatus = async (projectId: string, statusId: string) => {
  const response = await axiosInstance.get(`projects/${projectId}/issues`, {
    params: { statusId },
  });
  return response.data?.data || response.data;
};

const issueList = async (projectId: string, params?: { statusId?: string }) => {
  const response = await axiosInstance.get(`projects/${projectId}/issues`, { params });
  const data = response.data?.data || response.data;
  return data;
};

export const issueApi = {
  list: issueList,
  create: issueCreate,
  update: issueUpdate,
  delete: issueDelete,
  getDetail: issueGetDetail,
  getByStatus,
};
