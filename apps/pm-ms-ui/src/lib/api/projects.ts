import axios from 'axios';
import { Project } from '@shared/types/pmms';

const API_BASE_URL = '/api';

export interface ProjectsResponse {
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateProjectData {
  name: string;
  key: string;
  description?: string;
  type: 'software' | 'business' | 'service_desk';
  category: string;
  url?: string;
  avatar?: string;
}

export interface UpdateProjectData {
  name?: string;
  key?: string;
  description?: string;
  type?: 'software' | 'business' | 'service_desk';
  category?: string;
  url?: string;
  avatar?: string;
  status?: 'active' | 'archived';
}

export const projectsApi = {
  // Get all projects
  getProjects: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    search?: string;
  }): Promise<ProjectsResponse> => {
    const response = await axios.get(`${API_BASE_URL}/projects`, { params });
    return response.data;
  },

  // Get project by ID
  getProject: async (id: string): Promise<Project> => {
    const response = await axios.get(`${API_BASE_URL}/projects/${id}`);
    return response.data;
  },

  // Create new project
  createProject: async (data: CreateProjectData): Promise<Project> => {
    const response = await axios.post(`${API_BASE_URL}/projects`, data);
    return response.data;
  },

  // Update project
  updateProject: async (id: string, data: UpdateProjectData): Promise<Project> => {
    const response = await axios.put(`${API_BASE_URL}/projects/${id}`, data);
    return response.data;
  },

  // Delete project permanently
  deleteProject: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/projects/${id}`);
  },

  // Archive project
  archiveProject: async (id: string): Promise<Project> => {
    const response = await axios.post(`${API_BASE_URL}/projects/${id}/archive`);
    return response.data;
  },

  // Unarchive project
  unarchiveProject: async (id: string): Promise<Project> => {
    const response = await axios.delete(`${API_BASE_URL}/projects/${id}/archive`);
    return response.data;
  },

  // Get project members
  getProjectMembers: async (projectId: string) => {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/members`);
    return response.data;
  },

  // Add project member
  addProjectMember: async (projectId: string, data: { userId: string; role?: string }) => {
    const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/members`, data);
    return response.data;
  },
};
