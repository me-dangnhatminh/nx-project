'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { projectApi } from 'apps/pm-ms-ui/src/lib/api/project';
import { InviteUserInput } from 'apps/pm-ms-ui/src/lib/schemas/project';
import { User } from '../lib/types';

type ProjectMember = {
  user: User;
  role: string;
  permissions?: string[];
};

export const useProjectMembers = (projectId: string) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);

  const fetchMembers = useQuery({
    queryKey: [projectId, 'members'],
    queryFn: async () => {
      const data = await projectApi.memberList(projectId);
      const { members } = data; // TODO: fix
      setMembers(members || []);
      return data;
    },
  });

  const inviteMember = useMutation({
    mutationFn: async (input: InviteUserInput) => {
      const data = await projectApi.memberInvite({ projectId, ...input });
      setMembers((prev) => [...prev, data]);
      return data;
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (memberId: string) => {
      const data = await projectApi.memberDelete({ projectId, memberId });
      setMembers((prev) => prev.filter((member) => member.user.id !== memberId));
      return data;
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const data = await projectApi.memberUpdate({ projectId, memberId, role });
      setMembers((prev) =>
        prev.map((member) => (member.user.id === memberId ? { ...member, role } : member)),
      );
      return data;
    },
  });

  return {
    members,
    setMembers,
    fetchMembers,
    inviteMember,
    deleteMember,
    updateMemberRole,
  };
};

export const useProjectMember = (projectId: string, userId: string) => {
  const { members, fetchMembers } = useProjectMembers(projectId);

  const member = members.find((m) => m.user.id === userId);

  return {
    member,
    fetchMembers,
  };
};
