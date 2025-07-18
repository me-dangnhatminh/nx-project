'use client';

import { Button } from '@shadcn-ui/components/button';
import { useCallback, useState } from 'react';
import { XIcon } from 'lucide-react';
import Cropper from 'react-easy-crop';

import { cn } from '@shared/utils';

export const ChangeIconForm = ({
  onchangeIcon,
  icon,
}: {
  onchangeIcon?: (icon: string) => void;
  icon?: string | null;
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [tempIcon, setTempIcon] = useState<string | null>(null);

  const handleIconUpload = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            const iconUrl = loadEvent.target?.result as string;
            setTempIcon(iconUrl);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    },
    [setTempIcon],
  );

  return (
    <div
      className={cn(
        'w-full h-full flex items-center justify-center',
        'flex flex-col items-center justify-center gap-4',
      )}
    >
      <div hidden={tempIcon !== null}>
        <div>Drag Drop</div>
        <Button onClick={handleIconUpload} variant='outline'>
          Upload Icon
        </Button>
        <div>Default Icon: {icon || 'No icon selected'}</div>
      </div>

      <div
        hidden={tempIcon === null}
        className={cn('relative flex flex-col items-center justify-center')}
      >
        <XIcon
          onClick={() => {
            setTempIcon(null);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
          }}
          className='w-4 h-4 self-end mb-2 cursor-pointer'
        />

        <div
          className='relative w-full h-full overflow-hidden'
          style={{ width: 150 * 2, height: 150 * 2 }}
        >
          {tempIcon && (
            <Cropper
              image={tempIcon}
              aspect={1}
              crop={crop}
              zoom={zoom}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(croppedArea, croppedAreaPixels) => {
                // Handle the cropped area here
                const canvas = document.createElement('canvas');
                canvas.width = croppedAreaPixels.width;
                canvas.height = croppedAreaPixels.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  const img = new window.Image();
                  img.crossOrigin = 'anonymous';
                  img.src = tempIcon;
                  img.onload = () => {
                    ctx.drawImage(
                      img,
                      croppedAreaPixels.x,
                      croppedAreaPixels.y,
                      croppedAreaPixels.width,
                      croppedAreaPixels.height,
                      0,
                      0,
                      croppedAreaPixels.width,
                      croppedAreaPixels.height,
                    );
                    const croppedIconUrl = canvas.toDataURL('image/png');
                    onchangeIcon?.(croppedIconUrl);
                  };
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
