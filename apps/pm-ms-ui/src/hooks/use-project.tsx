import { useState } from 'react';
import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from 'apps/pm-ms-ui/src/lib/api/project';
import { Project, User } from 'apps/pm-ms-ui/src/lib/types';

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

  return { projects, setProjects, fetchProjects };
};

export const useProjectMembers = (projectId: string) => {
  const [members, setMembers] = useState<User[]>([]);

  const fetchMembers = useQuery({
    queryKey: [projectId, 'members'],
    queryFn: async () => {
      const data = await projectApi.memberList(projectId);
      setMembers(data.items || []);
      return data;
    },
  });

  return {
    members,
    setMembers,
    fetchMembers,
  };
};
