import { axiosInstance } from './_base';

import { CreateProjectInput } from 'apps/pm-ms-ui/src/lib/schemas/project';

const createProject = async (input: CreateProjectInput) => {
  const formData = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) {
      if (value instanceof File) formData.append(key, value);
      else formData.append(key, String(value));
    }
  });

  const res = await axiosInstance.post('/projects', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const data = res.data?.data || res.data;
  return data;
};

const getDetailProject = async (id: string) => {
  const response = await axiosInstance.get(`/projects/${id}`);
  return response.data;
};

const listProjects = async (params: { page?: number; pageSize?: number; search?: string } = {}) => {
  const response = await axiosInstance.get('/projects', { params });
  return response.data;
};

const deleteProject = async (projectId: string) => {
  const response = await axiosInstance.delete(`/projects/${projectId}`);
  return response.data;
};

const projectMembers = async (projectId: string) => {
  const response = await axiosInstance.get(`/projects/${projectId}/members`);
  const data = response.data?.data || response.data;
  return data;
};

const memberInvite = async (params: { projectId: string; inviteeId: string }) => {
  const { projectId, inviteeId } = params;
  const response = await axiosInstance.post(`/projects/${projectId}/members/invite`, { inviteeId });
  return response.data;
};

const memberDelete = async (params: { projectId: string; memberId: string }) => {
  const { projectId, memberId } = params;
  const response = await axiosInstance.delete(`/projects/${projectId}/members/${memberId}`);
  return response.data;
};

const memberUpdate = async (params: { projectId: string; memberId: string; role: string }) => {
  const { projectId, memberId, role } = params;
  const response = await axiosInstance.put(`/projects/${projectId}/members/${memberId}`, { role });
  return response.data;
};

const listIssueTypes = async (projectId: string) => {
  const response = await axiosInstance.get(`/projects/${projectId}/issue-types`);
  return response.data?.data || response.data;
};

export const projectApi = {
  get: getDetailProject,
  create: createProject,
  list: listProjects,
  delete: deleteProject,

  memberList: projectMembers,
  memberInvite: memberInvite,
  memberDelete: memberDelete,
  memberUpdate: memberUpdate,

  issueTypeList: listIssueTypes,
};
