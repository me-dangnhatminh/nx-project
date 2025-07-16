// import React, { useState, useCallback, useEffect } from 'react';
// import { Edit, Bold, Italic, List, Link, Image, Code } from 'lucide-react';
// import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@shadcn-ui/components/sheet';
// import { Button } from '@shadcn-ui/components/button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shadcn-ui/components/tabs';
// import { Label } from '@shadcn-ui/components/label';
// import { Textarea } from '@shadcn-ui/components/textarea';
// import { Avatar, AvatarFallback, AvatarImage } from '@shadcn-ui/components/avatar';
// import { Badge } from '@shadcn-ui/components/badge';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@shadcn-ui/components/select';

// import { Issue, MOCK_ACTIVITIES, USERS, User } from './in-type';
// import { format } from 'date-fns';
// import { Column } from './board-column';

// interface IssueDetailSheetProps {
//   issue: Issue | null;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onUpdate: (issue: Issue) => void;
//   columns: Column[];
// }

// const IssueDetailSheet: React.FC<IssueDetailSheetProps> = ({
//   issue,
//   open,
//   onOpenChange,
//   onUpdate,
//   columns,
// }) => {
//   const [description, setDescription] = useState(issue?.description || '');
//   const [editingDescription, setEditingDescription] = useState(false);

//   useEffect(() => {
//     if (issue) {
//       setDescription(issue.description || '');
//     }
//   }, [issue]);

//   const handleSaveDescription = useCallback(() => {
//     if (issue) {
//       onUpdate({
//         ...issue,
//         description: description,
//       });
//     }
//     setEditingDescription(false);
//   }, [issue, description, onUpdate]);

//   const handleAssigneeChange = useCallback(
//     (user: User | undefined) => {
//       if (issue) {
//         onUpdate({
//           ...issue,
//           assignee: user,
//         });
//       }
//     },
//     [issue, onUpdate],
//   );

//   const handleStatusChange = useCallback(
//     (status: string) => {
//       if (issue) {
//         onUpdate({
//           ...issue,
//           status: status,
//         });
//       }
//     },
//     [issue, onUpdate],
//   );

//   const handlePriorityChange = useCallback(
//     (priority: string) => {
//       if (issue) {
//         onUpdate({
//           ...issue,
//           priority: priority,
//         });
//       }
//     },
//     [issue, onUpdate],
//   );

//   if (!issue) return null;

//   const formatTimeAgo = (date: Date) => {
//     const now = new Date();
//     const diffInMs = now.getTime() - date.getTime();
//     const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

//     if (diffInHours < 1) {
//       const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
//       return `${diffInMinutes} minutes ago`;
//     } else if (diffInHours < 24) {
//       return `${diffInHours} hours ago`;
//     } else {
//       const diffInDays = Math.floor(diffInHours / 24);
//       return `${diffInDays} days ago`;
//     }
//   };

//   return (
//     <Sheet open={open} onOpenChange={onOpenChange}>
//       <SheetContent className='w-[800px] sm:max-w-[800px] overflow-y-auto'>
//         <SheetHeader className='border-b pb-4 mb-6'>
//           <div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
//             <span>NN-3</span>
//           </div>
//           <SheetTitle className='text-xl font-semibold text-left'>{issue.title}</SheetTitle>
//         </SheetHeader>

//         <div className='grid grid-cols-3 gap-6'>
//           {/* Main Content */}
//           <div className='col-span-2 space-y-6'>
//             {/* Description */}
//             <div>
//               <div className='flex items-center justify-between mb-3'>
//                 <h3 className='font-semibold'>Description</h3>
//                 <Button
//                   variant='outline'
//                   size='sm'
//                   onClick={() => setEditingDescription(!editingDescription)}
//                 >
//                   <Edit className='w-4 h-4 mr-1' />
//                   Edit
//                 </Button>
//               </div>

//               {editingDescription ? (
//                 <div className='space-y-3'>
//                   {/* Toolbar */}
//                   <div className='flex items-center gap-1 p-2 border-b'>
//                     <Button variant='ghost' size='sm'>
//                       <Bold className='w-4 h-4' />
//                     </Button>
//                     <Button variant='ghost' size='sm'>
//                       <Italic className='w-4 h-4' />
//                     </Button>
//                     <Button variant='ghost' size='sm'>
//                       <List className='w-4 h-4' />
//                     </Button>
//                     <Button variant='ghost' size='sm'>
//                       <Link className='w-4 h-4' />
//                     </Button>
//                     <Button variant='ghost' size='sm'>
//                       <Image className='w-4 h-4' />
//                     </Button>
//                     <Button variant='ghost' size='sm'>
//                       <Code className='w-4 h-4' />
//                     </Button>
//                   </div>

//                   <Textarea
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     placeholder='Add a description...'
//                     className='min-h-[150px] resize-none'
//                   />

//                   <div className='flex gap-2'>
//                     <Button onClick={handleSaveDescription}>Save</Button>
//                     <Button
//                       variant='outline'
//                       onClick={() => {
//                         setDescription(issue.description || '');
//                         setEditingDescription(false);
//                       }}
//                     >
//                       Cancel
//                     </Button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className='bg-gray-50 p-4 rounded-lg min-h-[100px]'>
//                   {description ? (
//                     <p className='text-gray-700 whitespace-pre-wrap'>{description}</p>
//                   ) : (
//                     <p className='text-gray-500 italic'>No description provided</p>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Activity */}
//             <div>
//               <h3 className='font-semibold mb-4'>Activity</h3>

//               <Tabs defaultValue='all' className='w-full'>
//                 <TabsList className='grid w-full grid-cols-4'>
//                   <TabsTrigger value='all'>All</TabsTrigger>
//                   <TabsTrigger value='comments'>Comments</TabsTrigger>
//                   <TabsTrigger value='history'>History</TabsTrigger>
//                   <TabsTrigger value='worklog'>Work log</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value='all' className='space-y-4 mt-4'>
//                   {MOCK_ACTIVITIES.map((activity) => (
//                     <div key={activity.id} className='flex gap-3'>
//                       <Avatar className='w-8 h-8'>
//                         <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
//                         <AvatarFallback>
//                           {activity.user.name
//                             .split(' ')
//                             .map((n) => n[0])
//                             .join('')}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className='flex-1'>
//                         <div className='flex items-center gap-2 text-sm'>
//                           <span className='font-medium'>{activity.user.name}</span>
//                           <span className='text-gray-600'>{activity.action}</span>
//                           <span className='text-gray-500'>{formatTimeAgo(activity.timestamp)}</span>
//                           {activity.type === 'HISTORY' && (
//                             <Badge variant='secondary' className='text-xs'>
//                               HISTORY
//                             </Badge>
//                           )}
//                         </div>
//                         {activity.content && (
//                           <div className='mt-2 p-3 bg-gray-50 rounded-lg'>
//                             <p className='text-sm text-gray-700'>{activity.content}</p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </TabsContent>

//                 <TabsContent value='comments'>
//                   {MOCK_ACTIVITIES.filter((a) => a.type === 'COMMENT').map((activity) => (
//                     <div key={activity.id} className='flex gap-3'>
//                       <Avatar className='w-8 h-8'>
//                         <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
//                         <AvatarFallback>
//                           {activity.user.name
//                             .split(' ')
//                             .map((n) => n[0])
//                             .join('')}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className='flex-1'>
//                         <div className='flex items-center gap-2 text-sm'>
//                           <span className='font-medium'>{activity.user.name}</span>
//                           <span className='text-gray-500'>{formatTimeAgo(activity.timestamp)}</span>
//                         </div>
//                         <div className='mt-2 p-3 bg-gray-50 rounded-lg'>
//                           <p className='text-sm text-gray-700'>{activity.content}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </TabsContent>

//                 <TabsContent value='history'>
//                   {MOCK_ACTIVITIES.filter((a) => a.type === 'HISTORY').map((activity) => (
//                     <div key={activity.id} className='flex gap-3'>
//                       <Avatar className='w-8 h-8'>
//                         <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
//                         <AvatarFallback>
//                           {activity.user.name
//                             .split(' ')
//                             .map((n) => n[0])
//                             .join('')}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className='flex-1'>
//                         <div className='flex items-center gap-2 text-sm'>
//                           <span className='font-medium'>{activity.user.name}</span>
//                           <span className='text-gray-600'>{activity.action}</span>
//                           <span className='text-gray-500'>{formatTimeAgo(activity.timestamp)}</span>
//                           <Badge variant='secondary' className='text-xs'>
//                             HISTORY
//                           </Badge>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </TabsContent>

//                 <TabsContent value='worklog'>
//                   <div className='text-center py-8 text-gray-500'>No work logged yet</div>
//                 </TabsContent>
//               </Tabs>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className='space-y-6'>
//             {/* Status */}
//             <div>
//               <Label className='text-sm font-medium'>Status</Label>
//               <Select value={issue.status || 'To Do'} onValueChange={handleStatusChange}>
//                 <SelectTrigger className='mt-1'>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {columns.map((column) => (
//                     <SelectItem key={column.id} value={column.title}>
//                       {column.title}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Details */}
//             <div className='space-y-4'>
//               <h4 className='font-medium'>Details</h4>

//               {/* Assignee */}
//               <div>
//                 <Label className='text-sm text-gray-600'>Assignee</Label>
//                 <div className='mt-1'>
//                   {issue.assignee ? (
//                     <div className='flex items-center gap-2'>
//                       <Avatar className='w-6 h-6'>
//                         <AvatarImage src={issue.assignee.avatar} alt={issue.assignee.name} />
//                         <AvatarFallback className='text-xs'>
//                           {issue.assignee.name
//                             .split(' ')
//                             .map((n) => n[0])
//                             .join('')}
//                         </AvatarFallback>
//                       </Avatar>
//                       <span className='text-sm'>{issue.assignee.name}</span>
//                     </div>
//                   ) : (
//                     <div className='text-sm text-gray-500'>
//                       Unassigned
//                       <Button variant='link' className='p-0 h-auto ml-1 text-blue-600'>
//                         Assign to me
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Reporter */}
//               <div>
//                 <Label className='text-sm text-gray-600'>Reporter</Label>
//                 <div className='mt-1 flex items-center gap-2'>
//                   <Avatar className='w-6 h-6'>
//                     <AvatarImage src={USERS[4].avatar} alt={USERS[4].name} />
//                     <AvatarFallback className='text-xs'>
//                       {USERS[4].name
//                         .split(' ')
//                         .map((n) => n[0])
//                         .join('')}
//                     </AvatarFallback>
//                   </Avatar>
//                   <span className='text-sm'>{USERS[4].name}</span>
//                 </div>
//               </div>

//               {/* Priority */}
//               <div>
//                 <Label className='text-sm text-gray-600'>Priority</Label>
//                 <Select value={issue.priority || 'Medium'} onValueChange={handlePriorityChange}>
//                   <SelectTrigger className='mt-1'>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value='Low'>🔽 Low</SelectItem>
//                     <SelectItem value='Medium'>➖ Medium</SelectItem>
//                     <SelectItem value='High'>🔺 High</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Labels */}
//               <div>
//                 <Label className='text-sm text-gray-600'>Labels</Label>
//                 <div className='mt-1 text-sm text-gray-500'>None</div>
//               </div>

//               {/* Due date */}
//               <div>
//                 <Label className='text-sm text-gray-600'>Due date</Label>
//                 <div className='mt-1 text-sm text-gray-500'>
//                   {issue.dueDate ? format(new Date(issue.dueDate), 'MMM dd, yyyy') : 'None'}
//                 </div>
//               </div>

//               {/* Time tracking */}
//               <div>
//                 <Label className='text-sm text-gray-600'>Time tracking</Label>
//                 <div className='mt-1 text-sm text-gray-500'>No time logged</div>
//               </div>

//               {/* Start date */}
//               <div>
//                 <Label className='text-sm text-gray-600'>Start date</Label>
//                 <div className='mt-1 text-sm text-gray-500'>None</div>
//               </div>

//               {/* Category */}
//               <div>
//                 <Label className='text-sm text-gray-600'>Category</Label>
//                 <div className='mt-1 text-sm text-gray-500'>None</div>
//               </div>

//               {/* Team */}
//               <div>
//                 <Label className='text-sm text-gray-600'>Team</Label>
//                 <div className='mt-1 text-sm text-gray-500'>None</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// };

// export default IssueDetailSheet;
