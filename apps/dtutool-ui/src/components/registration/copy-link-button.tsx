import { useRef, useState } from 'react';
import { Button } from '../common/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shadcn-ui/components/tooltip';
import { Share } from 'lucide-react';

export const CopyLinkButton = () => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1000);
  };

  return (
    <TooltipProvider>
      <Tooltip open={copied ? true : undefined}>
        <TooltipTrigger asChild>
          <Button size='icon' className='h-8 w-8 rounded-full cursor-pointer' onClick={handleCopy}>
            <Share className='h-4 w-4' />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='top' align='center'>
          {copied ? 'Copied!' : 'Copy link'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyLinkButton;
