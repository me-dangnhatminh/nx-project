import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shadcn-ui/components/dropdown-menu';
import { Button } from '@shadcn-ui/components/button';
import { MoreHorizontal, Edit, Trash } from 'lucide-react';

const BoardColumnActions: React.FC<{
  column: { id: string; name: string };
  onRename?: () => void;
  onDelete?: () => void;
}> = ({ column, onRename, onDelete }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='p-1'>
          <MoreHorizontal className='w-4 h-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {onRename && (
          <DropdownMenuItem onClick={onRename}>
            <Edit className='w-4 h-4 mr-2' />
            Rename
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={onDelete} className='text-red-600'>
            <Trash className='w-4 h-4 mr-2' />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BoardColumnActions;

// const ColumnActions: React.FC<ColumnActionsProps> = ({ column, onRename, onDelete }) => {
//   const [isRenaming, setIsRenaming] = useState(false);
//   const [newName, setNewName] = useState(column.name);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (isRenaming && inputRef.current) {
//       inputRef.current.focus();
//       inputRef.current.select();
//     }
//   }, [isRenaming]);

//   const handleRename = useCallback(() => {
//     if (newName.trim() && newName.trim() !== column.name) {
//       onRename(column.id, newName.trim());
//     }
//     setIsRenaming(false);
//   }, [newName, column.id, column.name, onRename]);

//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent) => {
//       if (e.key === 'Enter') {
//         handleRename();
//       } else if (e.key === 'Escape') {
//         setNewName(column.name);
//         setIsRenaming(false);
//       }
//     },
//     [handleRename, column.name],
//   );

//   const handleDelete = useCallback(() => {
//     if (
//       confirm(
//         `Are you sure you want to delete "${column.name}" column? This action cannot be undone.`,
//       )
//     ) {
//       onDelete(column.id);
//     }
//   }, [column.id, column.name, onDelete]);

//   if (isRenaming) {
//     return (
//       <Input
//         ref={inputRef}
//         value={newName}
//         onChange={(e) => setNewName(e.target.value)}
//         onBlur={handleRename}
//         onKeyDown={handleKeyDown}
//         className='text-sm font-semibold'
//       />
//     );
//   }

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <button className='text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1'>
//           <MoreHorizontal className='w-4 h-4' />
//         </button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align='end'>
//         <DropdownMenuItem onClick={() => setIsRenaming(true)}>
//           <Edit className='w-4 h-4 mr-2' />
//           Rename
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={handleDelete} className='text-red-600'>
//           <Trash className='w-4 h-4 mr-2' />
//           Delete
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// };
