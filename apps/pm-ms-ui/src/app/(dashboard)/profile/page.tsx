'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Briefcase,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Bell,
  Shield,
  Activity,
  Settings,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@shadcn-ui/components/button';
import { Input } from '@shadcn-ui/components/input';
import { Label } from '@shadcn-ui/components/label';
import { Textarea } from '@shadcn-ui/components/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@shadcn-ui/components/card';
import { Avatar, AvatarFallback, AvatarImage } from '@shadcn-ui/components/avatar';
import { Badge } from '@shadcn-ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shadcn-ui/components/tabs';
import { Switch } from '@shadcn-ui/components/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn-ui/components/select';
import { toast } from 'sonner';
import { projectsApi } from 'apps/pm-ms-ui/src/lib/api/project';

// Current user data based on login
const currentUser = {
  id: 'me-dangnhatminh',
  name: 'Minh Dang',
  email: 'me-dangnhatminh@example.com',
  avatar: '/avatar.png',
  role: 'admin',
  department: 'Engineering',
  bio: 'Full-stack developer passionate about creating innovative solutions. Experienced in React, Node.js, and cloud technologies.',
  location: 'Ho Chi Minh City, Vietnam',
  timezone: 'Asia/Ho_Chi_Minh',
  phoneNumber: '+84 901 234 567',
  dateOfBirth: '1995-03-15',
  joinedAt: '2024-01-15',
  lastLoginAt: '2025-07-08T13:07:53Z',
  skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker'],
  socialLinks: {
    github: 'https://github.com/me-dangnhatminh',
    linkedin: 'https://linkedin.com/in/me-dangnhatminh',
    twitter: 'https://twitter.com/me-dangnhatminh',
  },
};

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  joinedAt: string;
  lastLoginAt: string;
  skills: string[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

interface ProfileStats {
  projectsLead: number;
  projectsInvolved: number;
  issuesAssigned: number;
  issuesCompleted: number;
}

interface ActivityItem {
  id: string;
  type: 'project' | 'issue' | 'comment';
  action: string;
  target: string;
  description: string;
  timestamp: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile>(currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({
    projectsLead: 0,
    projectsInvolved: 0,
    issuesAssigned: 0,
    issuesCompleted: 0,
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Mock activity data
  const [activities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'project',
      action: 'created',
      target: 'E-commerce Platform',
      description: 'Created new project for online store development',
      timestamp: '2025-07-08T10:30:00Z',
    },
    {
      id: '2',
      type: 'issue',
      action: 'completed',
      target: 'ECP-123',
      description: 'Implemented user authentication system',
      timestamp: '2025-07-08T09:15:00Z',
    },
    {
      id: '3',
      type: 'issue',
      action: 'updated',
      target: 'MA-456',
      description: 'Updated mobile navigation bug status',
      timestamp: '2025-07-07T16:45:00Z',
    },
    {
      id: '4',
      type: 'comment',
      action: 'commented',
      target: 'ECP-124',
      description: 'Added feedback on dashboard design',
      timestamp: '2025-07-07T14:20:00Z',
    },
  ]);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    projectUpdates: true,
    issueAssignments: true,
    commentReplies: true,
    weeklyDigest: false,
    securityAlerts: true,
  });

  // Fetch user stats
  const fetchUserStats = async () => {
    try {
      setLoading(true);

      // Fetch projects where user is lead
      const allProjects = await projectsApi.getProjects({ limit: 100 });
      const projectsLead = allProjects.data.filter((p) => p.lead.id === user.id).length;
      const projectsInvolved = allProjects.data.filter(
        (p) => p.members?.some((m) => m.id === user.id) || p.lead.id === user.id,
      ).length;

      setStats({
        projectsLead,
        projectsInvolved,
        issuesAssigned: 12, // Mock data until issues API is ready
        issuesCompleted: 8,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to update user profile
      // await userApi.updateProfile(user.id, user);

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement API call to change password
      // await userApi.changePassword(passwordData);

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [key]: value }));
    // TODO: Implement API call to update notification settings
    toast.success('Notification settings updated');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return '📁';
      case 'issue':
        return '🎯';
      case 'comment':
        return '💬';
      default:
        return '📋';
    }
  };

  return (
    <div className='p-4 sm:p-6 space-y-6 max-w-6xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Profile</h1>
          <p className='text-gray-600'>Manage your account settings and preferences</p>
        </div>
        <div className='text-sm text-gray-500'>Last login: {formatDateTime(user.lastLoginAt)}</div>
      </div>

      <Tabs defaultValue='profile' className='w-full'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          <TabsTrigger value='activity'>Activity</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value='profile' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* Profile Info */}
            <div className='lg:col-span-2 space-y-6'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle>Personal Information</CardTitle>
                    {!isEditing ? (
                      <Button variant='outline' size='sm' onClick={() => setIsEditing(true)}>
                        <Edit className='w-4 h-4 mr-2' />
                        Edit
                      </Button>
                    ) : (
                      <div className='flex space-x-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setIsEditing(false)}
                          disabled={loading}
                        >
                          <X className='w-4 h-4 mr-2' />
                          Cancel
                        </Button>
                        <Button size='sm' onClick={handleSaveProfile} disabled={loading}>
                          {loading ? (
                            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                          ) : (
                            <Save className='w-4 h-4 mr-2' />
                          )}
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='name'>Full Name</Label>
                      <Input
                        id='name'
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor='email'>Email</Label>
                      <Input
                        id='email'
                        type='email'
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor='phone'>Phone Number</Label>
                      <Input
                        id='phone'
                        value={user.phoneNumber || ''}
                        onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor='location'>Location</Label>
                      <Input
                        id='location'
                        value={user.location || ''}
                        onChange={(e) => setUser({ ...user, location: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor='department'>Department</Label>
                      <Input
                        id='department'
                        value={user.department || ''}
                        onChange={(e) => setUser({ ...user, department: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor='timezone'>Timezone</Label>
                      <Select
                        value={user.timezone || 'Asia/Ho_Chi_Minh'}
                        onValueChange={(value) => setUser({ ...user, timezone: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Asia/Ho_Chi_Minh'>Ho Chi Minh City (GMT+7)</SelectItem>
                          <SelectItem value='Asia/Tokyo'>Tokyo (GMT+9)</SelectItem>
                          <SelectItem value='Europe/London'>London (GMT+0)</SelectItem>
                          <SelectItem value='America/New_York'>New York (GMT-5)</SelectItem>
                          <SelectItem value='America/Los_Angeles'>Los Angeles (GMT-8)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='bio'>Bio</Label>
                    <Textarea
                      id='bio'
                      value={user.bio || ''}
                      onChange={(e) => setUser({ ...user, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                      placeholder='Tell us about yourself...'
                    />
                  </div>

                  <div>
                    <Label>Skills</Label>
                    <div className='flex flex-wrap gap-2 mt-2'>
                      {user.skills.map((skill, index) => (
                        <Badge key={index} variant='secondary'>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    {isEditing && (
                      <p className='text-xs text-gray-500 mt-1'>
                        Skill management will be available soon
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Profile Picture */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className='text-center'>
                  <Avatar className='h-24 w-24 mx-auto mb-4'>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className='text-lg'>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <Button variant='outline' size='sm'>
                    <Camera className='w-4 h-4 mr-2' />
                    Change Photo
                  </Button>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {loading ? (
                    <div className='flex justify-center'>
                      <Loader2 className='h-6 w-6 animate-spin' />
                    </div>
                  ) : (
                    <>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Projects Leading</span>
                        <span className='font-semibold'>{stats.projectsLead}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Projects Involved</span>
                        <span className='font-semibold'>{stats.projectsInvolved}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Issues Assigned</span>
                        <span className='font-semibold'>{stats.issuesAssigned}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Issues Completed</span>
                        <span className='font-semibold'>{stats.issuesCompleted}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center space-x-2 text-sm'>
                    <User className='w-4 h-4 text-gray-500' />
                    <span className='text-gray-600'>Role:</span>
                    <Badge variant='outline'>{user.role}</Badge>
                  </div>
                  <div className='flex items-center space-x-2 text-sm'>
                    <Calendar className='w-4 h-4 text-gray-500' />
                    <span className='text-gray-600'>Joined:</span>
                    <span>{formatDate(user.joinedAt)}</span>
                  </div>
                  <div className='flex items-center space-x-2 text-sm'>
                    <Activity className='w-4 h-4 text-gray-500' />
                    <span className='text-gray-600'>Last Active:</span>
                    <span>{formatDateTime(user.lastLoginAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value='security' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Change Password */}
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h3 className='font-medium'>Password</h3>
                    <p className='text-sm text-gray-600'>Change your account password</p>
                  </div>
                  <Button
                    variant='outline'
                    onClick={() => setShowChangePassword(!showChangePassword)}
                  >
                    <Lock className='w-4 h-4 mr-2' />
                    Change Password
                  </Button>
                </div>

                {showChangePassword && (
                  <div className='border rounded-lg p-4 space-y-4'>
                    <div>
                      <Label htmlFor='currentPassword'>Current Password</Label>
                      <div className='relative'>
                        <Input
                          id='currentPassword'
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, currentPassword: e.target.value })
                          }
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                          onClick={() =>
                            setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                          }
                        >
                          {showPasswords.current ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor='newPassword'>New Password</Label>
                      <div className='relative'>
                        <Input
                          id='newPassword'
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, newPassword: e.target.value })
                          }
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                          onClick={() =>
                            setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                          }
                        >
                          {showPasswords.new ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                      <div className='relative'>
                        <Input
                          id='confirmPassword'
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                          }
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                          onClick={() =>
                            setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                          }
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className='flex space-x-2'>
                      <Button onClick={handleChangePassword} disabled={loading}>
                        {loading ? (
                          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        ) : (
                          <Save className='w-4 h-4 mr-2' />
                        )}
                        Update Password
                      </Button>
                      <Button
                        variant='outline'
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Two-Factor Authentication */}
              <div className='border-t pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Two-Factor Authentication</h3>
                    <p className='text-sm text-gray-600'>
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant='outline'>
                    <Shield className='w-4 h-4 mr-2' />
                    Enable 2FA
                  </Button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className='border-t pt-6'>
                <h3 className='font-medium mb-4'>Active Sessions</h3>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between p-3 border rounded-lg'>
                    <div>
                      <p className='font-medium'>Current Session</p>
                      <p className='text-sm text-gray-600'>
                        Chrome on Windows • Ho Chi Minh City, Vietnam
                      </p>
                      <p className='text-xs text-gray-500'>
                        Last active: {formatDateTime(user.lastLoginAt)}
                      </p>
                    </div>
                    <Badge variant='secondary'>Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value='notifications' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Email Notifications</h3>
                    <p className='text-sm text-gray-600'>Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleNotificationChange('emailNotifications', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Project Updates</h3>
                    <p className='text-sm text-gray-600'>Get notified about project changes</p>
                  </div>
                  <Switch
                    checked={notificationSettings.projectUpdates}
                    onCheckedChange={(checked) =>
                      handleNotificationChange('projectUpdates', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Issue Assignments</h3>
                    <p className='text-sm text-gray-600'>
                      Notifications when issues are assigned to you
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.issueAssignments}
                    onCheckedChange={(checked) =>
                      handleNotificationChange('issueAssignments', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Comment Replies</h3>
                    <p className='text-sm text-gray-600'>
                      Get notified when someone replies to your comments
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.commentReplies}
                    onCheckedChange={(checked) =>
                      handleNotificationChange('commentReplies', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Weekly Digest</h3>
                    <p className='text-sm text-gray-600'>
                      Receive a weekly summary of your activity
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyDigest}
                    onCheckedChange={(checked) => handleNotificationChange('weeklyDigest', checked)}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Security Alerts</h3>
                    <p className='text-sm text-gray-600'>
                      Important security notifications (recommended)
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.securityAlerts}
                    onCheckedChange={(checked) =>
                      handleNotificationChange('securityAlerts', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value='activity' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className='flex items-start space-x-3 p-3 border rounded-lg'
                  >
                    <div className='text-lg'>{getActivityIcon(activity.type)}</div>
                    <div className='flex-1'>
                      <p className='text-sm'>
                        <span className='font-medium'>{activity.action}</span> {activity.target}
                      </p>
                      <p className='text-xs text-gray-600'>{activity.description}</p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
