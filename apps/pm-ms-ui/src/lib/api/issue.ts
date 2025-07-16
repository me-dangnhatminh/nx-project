import { axiosInstance } from './_base';
import { CreateIssueInput } from 'apps/pm-ms-ui/src/lib/schemas/issue';

const listBoardIssues = async (params: { projectId: string }) => {
  const response = await axiosInstance.get(`projects/${params.projectId}/view/board`);
  return response.data?.data || response.data;
};
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

export const issueApi = {
  create: issueCreate,
  update: issueUpdate,
  delete: issueDelete,
  getDetail: issueGetDetail,
  listBoard: listBoardIssues,
  getByStatus,
};
