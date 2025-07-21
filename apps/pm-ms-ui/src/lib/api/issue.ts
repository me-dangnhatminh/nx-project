import { CreateIssueStatusInput } from '../schemas/issue-status';
import { axiosInstance } from './_base';
import { CreateIssueInput, ReorderIssueInput } from 'apps/pm-ms-ui/src/lib/schemas/issue';

const issueDetail = async (projectId: string, issueId: string) => {
  const response = await axiosInstance.get(`projects/${projectId}/issues/${issueId}`);
  return response.data?.data || response.data;
};
const issueList = async (projectId: string, params?: { statusId?: string }) => {
  const response = await axiosInstance.get(`projects/${projectId}/issues`, { params });
  const data = response.data?.data || response.data;
  return data;
};
const issueCreate = async (projectId: string, input: CreateIssueInput) => {
  const response = await axiosInstance.post(`projects/${projectId}/issues`, input);
  return response.data?.data || response.data;
};
const issueUpdate = async (projectId: string, issueId: string, input: CreateIssueInput) => {
  const response = await axiosInstance.put(`projects/${projectId}/issues/${issueId}`, input);
  return response.data?.data || response.data;
};
const issueDelete = async (projectId: string, issueId: string) => {
  const response = await axiosInstance.delete(`projects/${projectId}/issues/${issueId}`);
  return response.data?.data || response.data;
};

const issueReorder = async (projectId: string, input: ReorderIssueInput) => {
  const response = await axiosInstance.post(`projects/${projectId}/issues/reorder`, input);
  return response.data?.data || response.data;
};

const issueStatusList = async (projectId: string) => {
  const response = await axiosInstance.get(`projects/${projectId}/issue-statuses`);
  return response.data?.data || response.data;
};

const issueStatusCreate = async (projectId: string, input: CreateIssueStatusInput) => {
  const response = await axiosInstance.post(`projects/${projectId}/issue-statuses`, input);
  return response.data?.data || response.data;
};

const issueStatusReorder = async (
  projectId: string,
  input: {
    source: { id: string }[];
    dest: { destType?: 'before' | 'after'; destParam?: string };
  },
) => {
  const response = await axiosInstance.post(`projects/${projectId}/issue-statuses/reorder`, input);
  return response.data?.data || response.data;
};

const issuePriorityList = async (projectId: string) => {
  const response = await axiosInstance.get(`projects/${projectId}/issue-priorities`);
  return response.data?.data || response.data;
};

const issueTypeList = async (projectId: string) => {
  const response = await axiosInstance.get(`projects/${projectId}/issue-types`);
  return response.data?.data || response.data;
};

export const issueApi = {
  get: issueDetail,
  list: issueList,
  create: issueCreate,
  reorder: issueReorder,
  update: issueUpdate,
  delete: issueDelete,

  statusList: issueStatusList,
  statusReorder: issueStatusReorder,
  statusCreate: issueStatusCreate,
  priorityList: issuePriorityList,
  typeList: issueTypeList,
};
