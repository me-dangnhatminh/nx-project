'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { X } from 'lucide-react';

export interface SwipeSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Called when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** Content to display inside the sheet */
  children: React.ReactNode;
  /** Side from which the sheet appears */
  side?: 'left' | 'right' | 'bottom';
  /** Custom class name for the sheet */
  className?: string;
  /** How far (in px) the user needs to swipe to close the sheet */
  swipeThreshold?: number;
  /** How fast (in px/ms) the user needs to swipe to close the sheet */
  velocityThreshold?: number;
  /** Whether to show a close button in the corner */
  showCloseButton?: boolean;
  /** Custom title for the sheet */
  title?: string;
  /** Whether to show a backdrop */
  showBackdrop?: boolean;
  /** Whether to close when clicked outside */
  closeOnClickOutside?: boolean;
  /** Whether to close on Escape key */
  closeOnEscape?: boolean;
  /** Whether to render with a border radius */
  rounded?: boolean;
}

export const SwipeSheet = ({
  open,
  onOpenChange,
  children,
  side = 'right',
  className = '',
  swipeThreshold = 100,
  velocityThreshold = 0.5,
  showCloseButton = true,
  title,
  showBackdrop = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  rounded = false,
}: SwipeSheetProps) => {
  const [isSwiping, setIsSwiping] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const lastTimestamp = useRef<number>(0);
  const velocityTracker = useRef<number>(0);

  // Use a separate ref for tracking if we should handle touch events
  // This prevents re-rendering during touch interactions
  const shouldHandleTouch = useRef<boolean>(true);

  // Motion values with hardware acceleration
  const x = useMotionValue(0);
  const opacity = useTransform(
    x,
    side === 'right' ? [0, swipeThreshold * 0.75] : [0, -swipeThreshold * 0.75],
    [1, 0.5],
  );

  // Memoize the position computation for better performance
  const getInitialPos = useCallback(() => {
    switch (side) {
      case 'left':
        return { x: '-100%', y: 0 };
      case 'right':
        return { x: '100%', y: 0 };
      case 'bottom':
        return { x: 0, y: '100%' };
      default:
        return { x: '100%', y: 0 };
    }
  }, [side]);

  // Reset position when opened - using RAF for smoother animation
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        x.set(0);
      });
    }
  }, [open, x]);

  // Handle Escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (open && e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onOpenChange, closeOnEscape]);

  // Optimized event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!shouldHandleTouch.current) return;

    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    lastTimestamp.current = Date.now();
    velocityTracker.current = 0;

    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isSwiping || !sheetRef.current) return;

      const touch = e.touches[0];

      // Calculate delta time for velocity tracking
      const now = Date.now();
      const deltaTime = now - lastTimestamp.current;
      lastTimestamp.current = now;

      // Check if we should handle vertical or horizontal swipes
      if (shouldHandleTouch.current) {
        const deltaX = touch.clientX - startX.current;
        const deltaY = touch.clientY - startY.current;

        // Determine direction and whether we should handle this swipe
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          if (side === 'bottom' && Math.abs(deltaY) < Math.abs(deltaX)) {
            shouldHandleTouch.current = false;
            return;
          } else if (side !== 'bottom' && Math.abs(deltaX) < Math.abs(deltaY)) {
            shouldHandleTouch.current = false;
            return;
          }
        }
      }

      // Different calculations based on side with performance optimizations
      if (side === 'right') {
        // Only allow right swipes (positive direction)
        const dragX = Math.max(
          0,
          touch.clientX - (window.innerWidth - sheetRef.current.offsetWidth),
        );

        // Update velocity tracker
        if (deltaTime > 0) {
          const instantVelocity = dragX - x.get() / deltaTime;
          velocityTracker.current = 0.8 * velocityTracker.current + 0.2 * instantVelocity;
        }

        // Use requestAnimationFrame for smoother updates
        requestAnimationFrame(() => {
          x.set(dragX);
        });
      } else if (side === 'left') {
        // Only allow left swipes (negative direction)
        const dragX = Math.min(0, touch.clientX - sheetRef.current.offsetWidth);

        // Update velocity tracker
        if (deltaTime > 0) {
          const instantVelocity = (dragX - x.get()) / deltaTime;
          velocityTracker.current = 0.8 * velocityTracker.current + 0.2 * instantVelocity;
        }

        requestAnimationFrame(() => {
          x.set(dragX);
        });
      } else if (side === 'bottom') {
        // Only allow bottom swipes (positive direction)
        const dragY = Math.max(
          0,
          touch.clientY - (window.innerHeight - sheetRef.current.offsetHeight),
        );

        // Update velocity tracker
        if (deltaTime > 0) {
          const instantVelocity = (dragY - x.get()) / deltaTime;
          velocityTracker.current = 0.8 * velocityTracker.current + 0.2 * instantVelocity;
        }

        requestAnimationFrame(() => {
          x.set(dragY);
        });
      }
    },
    [isSwiping, side, x],
  );

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;

    shouldHandleTouch.current = true;

    const currentX = x.get();
    let shouldClose = false;

    // Check if swipe distance is enough to close
    if (side === 'right' && currentX > swipeThreshold) {
      shouldClose = true;
    } else if (side === 'left' && currentX < -swipeThreshold) {
      shouldClose = true;
    } else if (side === 'bottom' && currentX > swipeThreshold) {
      shouldClose = true;
    }

    // Also check velocity for more responsive feel
    if (Math.abs(velocityTracker.current) > velocityThreshold) {
      if (
        (side === 'right' && velocityTracker.current > 0) ||
        (side === 'left' && velocityTracker.current < 0) ||
        (side === 'bottom' && velocityTracker.current > 0)
      ) {
        shouldClose = true;
      }
    }

    if (shouldClose) {
      handleClose();
    } else {
      // Return to start position with smooth animation
      animateValue(x, 0, {
        type: 'spring',
        stiffness: 500,
        damping: 40,
      });
    }

    setIsSwiping(false);
  }, [isSwiping, side, swipeThreshold, velocityThreshold, x]);

  // Close animation with optimized spring physics
  const handleClose = useCallback(() => {
    const target =
      side === 'right'
        ? window.innerWidth
        : side === 'left'
        ? -window.innerWidth
        : window.innerHeight;

    animateValue(x, target, {
      type: 'spring',
      stiffness: 300, // Lower stiffness for smoother animation
      damping: 30, // Optimized damping
      onComplete: () => {
        onOpenChange(false);
        // Use RAF instead of setTimeout for better timing
        requestAnimationFrame(() => {
          x.set(0);
        });
      },
    });
  }, [onOpenChange, side, x]);

  // Determine classes based on side - memoized to prevent recalculation
  const getSheetClasses = useCallback(() => {
    const base = 'fixed z-50 shadow-lg flex flex-col will-change-transform';
    const sideClasses = {
      left: 'left-0 top-0 bottom-0',
      right: 'right-0 top-0 bottom-0',
      bottom: 'bottom-0 left-0 right-0',
    };

    const widthClass = side === 'bottom' ? 'h-auto max-h-[80vh]' : 'w-[85vw] sm:w-[400px]';
    const roundedClass = rounded
      ? side === 'bottom'
        ? 'rounded-t-xl'
        : side === 'left'
        ? 'rounded-r-xl'
        : 'rounded-l-xl'
      : '';

    return `${base} ${sideClasses[side]} ${widthClass} ${roundedClass} ${className}`;
  }, [side, rounded, className]);

  // Optimized animation function with better performance
  function animateValue(value: any, to: number, options: any) {
    const startValue = value.get();
    let startTime: number | null = null;
    let animationFrame: number;
    let done = false;

    const duration = options.duration || 0.3;
    const stiffness = options.stiffness || 300;
    const damping = options.damping || 30;

    // Use spring physics for more natural animation
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      // Simple spring physics
      const progress = Math.min(elapsed / duration, 1);
      const spring = 1 - Math.pow(Math.E, -stiffness * elapsed);
      const damped = 1 - Math.exp(-damping * elapsed);

      // Combine for smooth animation
      const easedProgress = spring * damped;

      const newValue = startValue + (to - startValue) * easedProgress;
      value.set(newValue);

      if (Math.abs(newValue - to) > 0.1 && elapsed < 2) {
        animationFrame = requestAnimationFrame(step);
      } else {
        // Snap to final position to avoid floating point issues
        value.set(to);
        done = true;
        if (options.onComplete) options.onComplete();
      }
    };

    animationFrame = requestAnimationFrame(step);

    return {
      stop: () => {
        if (!done) {
          cancelAnimationFrame(animationFrame);
          done = true;
        }
      },
    };
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with optimized rendering */}
          {showBackdrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className='fixed inset-0 bg-black/50 z-40'
              onClick={() => closeOnClickOutside && onOpenChange(false)}
              style={{
                willChange: 'opacity',
                backfaceVisibility: 'hidden',
              }}
            />
          )}

          {/* Sheet with hardware acceleration */}
          <motion.div
            ref={sheetRef}
            className={getSheetClasses()}
            initial={getInitialPos()}
            animate={{ x: 0, y: 0 }}
            exit={getInitialPos()}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              [side === 'bottom' ? 'y' : 'x']: x,
              opacity: side !== 'bottom' ? opacity : undefined,
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
              touchAction: side === 'bottom' ? 'pan-x' : 'pan-y',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header with title and close button */}
            {(title || showCloseButton) && (
              <div className='flex items-center justify-between p-4 border-b bg-background'>
                {title && <h3 className='text-lg font-medium'>{title}</h3>}
                {showCloseButton && (
                  <button
                    type='button'
                    className='rounded-full h-8 w-8 flex items-center justify-center hover:bg-muted'
                    onClick={() => onOpenChange(false)}
                    aria-label='Close'
                  >
                    <X className='h-4 w-4' />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className='flex-1 overflow-auto p-4 bg-background'>{children}</div>

            {/* Swipe indicator */}
            <div
              className={`absolute ${
                side === 'right'
                  ? 'left-0 top-1/2 -translate-y-1/2 h-24 w-1'
                  : side === 'left'
                  ? 'right-0 top-1/2 -translate-y-1/2 h-24 w-1'
                  : 'top-0 left-1/2 -translate-x-1/2 w-24 h-1'
              } bg-primary/10 rounded ${
                side === 'right' ? 'rounded-r' : side === 'left' ? 'rounded-l' : 'rounded-b'
              }`}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SwipeSheet;
