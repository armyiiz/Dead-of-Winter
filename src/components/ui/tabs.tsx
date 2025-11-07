import { ButtonHTMLAttributes, HTMLAttributes, createContext, useContext, useMemo, useState } from 'react';
import { cn } from '../../lib/utils';

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext(component: string) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} must be used within <Tabs>`);
  }
  return context;
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

export const Tabs = ({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const currentValue = value ?? internalValue;

  const contextValue = useMemo<TabsContextValue>(() => ({
    value: currentValue,
    setValue: (next: string) => {
      if (value === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
  }), [currentValue, onValueChange, value]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('ui-tabs', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn('ui-tabs-list', className)} {...props} />;
};

interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = ({ value, className, ...props }: TabsTriggerProps) => {
  const context = useTabsContext('TabsTrigger');
  const isActive = context.value === value;

  return (
    <button
      type="button"
      className={cn('ui-tabs-trigger', isActive && 'ui-tabs-trigger--active', className)}
      onClick={() => context.setValue(value)}
      {...props}
    />
  );
};

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = ({ value, className, ...props }: TabsContentProps) => {
  const context = useTabsContext('TabsContent');
  const isActive = context.value === value;

  return (
    <div
      className={cn('ui-tabs-content', className)}
      data-state={isActive ? 'active' : 'inactive'}
      {...props}
    />
  );
};
