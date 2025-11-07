import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEvent,
  ReactElement,
  cloneElement,
  createContext,
  useContext,
} from 'react';
import { cn } from '../../lib/utils';

interface ModalContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

function useModalContext(component: string) {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error(`${component} must be used within <ModalRoot>`);
  }
  return context;
}

interface ModalRootProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactElement | ReactElement[];
}

export const ModalRoot = ({ open, onOpenChange, children }: ModalRootProps) => {
  return (
    <ModalContext.Provider value={{ open, setOpen: onOpenChange }}>
      {children}
    </ModalContext.Provider>
  );
};

interface ModalTriggerProps {
  children: ReactElement;
}

export const ModalTrigger = ({ children }: ModalTriggerProps) => {
  const context = useModalContext('ModalTrigger');

  return cloneElement(children, {
    onClick: (event: MouseEvent) => {
      children.props.onClick?.(event);
      context.setOpen(true);
    },
    'aria-expanded': context.open,
  });
};

interface ModalContentProps extends HTMLAttributes<HTMLDivElement> {}

export const ModalContent = ({ className, ...props }: ModalContentProps) => {
  const context = useModalContext('ModalContent');

  if (!context.open) {
    return null;
  }

  return (
    <div className="ui-modal-backdrop">
      <div className={cn('ui-modal', className)} role="dialog" aria-modal="true" {...props} />
    </div>
  );
};

export const ModalHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4', className)} {...props} />
);

export const ModalFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-4 flex gap-2 justify-end', className)} {...props} />
);

export const ModalTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn('text-2xl font-bold mb-2', className)} {...props} />
);

export const ModalDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted', className)} {...props} />
);

interface ModalCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const ModalClose = ({ className, children, ...props }: ModalCloseProps) => {
  const context = useModalContext('ModalClose');

  return (
    <button
      type="button"
      className={cn('ui-button ui-button--ghost', className)}
      onClick={(event) => {
        props.onClick?.(event);
        context.setOpen(false);
      }}
      {...props}
    >
      {children ?? 'Close'}
    </button>
  );
};
