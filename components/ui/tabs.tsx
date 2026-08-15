'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return context;
}

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn('flex flex-wrap gap-6 border-b border-border', className)}
      {...props}
    />
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  disabledTooltip?: string;
}

export function TabsTrigger({
  className,
  value,
  children,
  disabled,
  disabledTooltip,
  ...props
}: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isActive = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled || undefined}
      title={disabled && disabledTooltip ? disabledTooltip : undefined}
      className={cn(
        'relative inline-flex min-h-10 min-w-10 items-center justify-center pb-3 text-[15px] font-semibold text-body',
        'hover:text-ink motion-safe:transition-colors motion-safe:duration-150',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        isActive && 'tab-active',
        disabled && 'cursor-not-allowed opacity-40 hover:text-body',
        className,
      )}
      onClick={() => {
        if (!disabled) {
          onValueChange(value);
        }
      }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ className, value, children, ...props }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();

  if (selectedValue !== value) {
    return null;
  }

  return (
    <div role="tabpanel" className={cn('pt-6', className)} {...props}>
      {children}
    </div>
  );
}
