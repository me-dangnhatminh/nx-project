import { useState } from 'react';
import { create } from 'zustand';
import { useMutation, useQuery } from '@tanstack/react-query';
import { projectApi } from 'apps/pm-ms-ui/src/lib/api/project';
import { Project, User } from 'apps/pm-ms-ui/src/lib/types';
import { CreateProjectInput, InviteUserInput } from 'apps/pm-ms-ui/src/lib/schemas/project';

type SetProjects = React.Dispatch<React.SetStateAction<Project[]>>;
const useProjectStore = create<{
  projects: Project[];
  setProjects: SetProjects;
}>((set) => ({
  projects: [],
  setProjects: (update: Project[] | ((prev: Project[]) => Project[])) => {
    if (typeof update === 'function') set((state) => ({ projects: update(state.projects) }));
    else set({ projects: update });
  },
}));

export const useProject = (projectId: string) => {
  const [project, setProject] = useState<Project>();
  const fetchProject = useQuery({
    queryKey: ['project'],
    queryFn: async () => {
      const data = await projectApi.get(projectId);
      setProject(data);
      return data;
    },
  });

  return { project, setProject, fetchProject };
};

export const useProjects = () => {
  const { projects, setProjects } = useProjectStore();

  const fetchProjects = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const data = await projectApi.list();
      setProjects(data.items || []);
      return data;
    },
  });

  const createProject = useMutation({
    mutationFn: async (newProject: CreateProjectInput) => {
      const data = await projectApi.create(newProject);
      setProjects((prev) => [...prev, data]);
      return data;
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      await projectApi.delete(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    },
  });

  return {
    projects,
    setProjects,
    fetchProjects,
    createProject,
    fetchProject: fetchProjects,
    deleteProject,
  };
};
