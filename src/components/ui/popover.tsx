import {
  HTMLAttributes,
  MouseEvent,
  MutableRefObject,
  ReactElement,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cn, composeRefs } from '../../lib/utils';

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  contentRef: MutableRefObject<HTMLDivElement | null>;
};

const PopoverContext = createContext<PopoverContextValue | undefined>(undefined);

function usePopoverContext(component: string) {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error(`${component} must be used within <Popover>`);
  }
  return context;
}

export const Popover = ({ className, children }: HTMLAttributes<HTMLDivElement>) => {
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!contentRef.current || !triggerRef.current) return;
      const target = event.target as Node;
      if (!contentRef.current.contains(target) && !triggerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const value = useMemo<PopoverContextValue>(
    () => ({ open, setOpen, triggerRef, contentRef }),
    [open]
  );

  return (
    <PopoverContext.Provider value={value}>
      <div className={cn('relative', className)}>{children}</div>
    </PopoverContext.Provider>
  );
};

interface PopoverTriggerProps {
  children: ReactElement;
}

export const PopoverTrigger = ({ children }: PopoverTriggerProps) => {
  const context = usePopoverContext('PopoverTrigger');

  return cloneElement(children, {
    ref: composeRefs((children as any).ref, (node: HTMLElement | null) => {
      context.triggerRef.current = node;
    }),
    onClick: (event: MouseEvent) => {
      children.props.onClick?.(event);
      context.setOpen(!context.open);
    },
    'aria-expanded': context.open,
  });
};

interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {}

export const PopoverContent = ({ className, ...props }: PopoverContentProps) => {
  const context = usePopoverContext('PopoverContent');

  if (!context.open) {
    return null;
  }

  return (
    <div
      ref={composeRefs(context.contentRef as any)}
      className={cn('ui-popover', className)}
      {...props}
    />
  );
};
