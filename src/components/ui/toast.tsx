import { ReactNode, createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

type ToastVariant = 'default' | 'success' | 'danger';

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

export type Toast = ToastOptions & {
  id: string;
};

type ToastContextValue = {
  toasts: Toast[];
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 4000;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeouts = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeoutId = timeouts.current.get(id);
    if (timeoutId && typeof window !== 'undefined') {
      window.clearTimeout(timeoutId);
      timeouts.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ duration = DEFAULT_DURATION, variant = 'default', ...options }: ToastOptions) => {
      const id = Math.random().toString(36).slice(2, 10);
      const toastValue: Toast = {
        id,
        variant,
        ...options,
      };

      setToasts((current) => [...current, toastValue]);

      if (duration !== Infinity && typeof window !== 'undefined') {
        const timeoutId = window.setTimeout(() => {
          dismiss(id);
        }, duration);
        timeouts.current.set(id, timeoutId);
      }
    },
    [dismiss]
  );

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, toast, dismiss }),
    [dismiss, toast, toasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="ui-toast-viewport" role="region" aria-live="polite">
        {toasts.map(({ id, title, description, variant }) => (
          <div key={id} className={cn('ui-toast', variant && variant !== 'default' && `ui-toast--${variant}`)}>
            <button className="ui-toast__close" onClick={() => dismiss(id)} aria-label="Dismiss notification">
              ×
            </button>
            {title && <div className="ui-toast__title">{title}</div>}
            {description && <div className="ui-toast__description">{description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return context;
}
