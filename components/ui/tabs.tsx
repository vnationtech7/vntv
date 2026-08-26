"use client";

import {
  createContext,
  useContext,
  useState,
  HTMLAttributes,
  ButtonHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs");
  }
  return context;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const handleValueChange = onValueChange || setUncontrolledValue;

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn("", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 bg-[--color-background-panel] border border-[--color-border] rounded-sm p-1",
        className
      )}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({
  className,
  value: triggerValue,
  children,
  ...props
}: TabsTriggerProps) {
  const { value, onValueChange } = useTabsContext();
  const isActive = value === triggerValue;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 text-[12px] font-bold uppercase tracking-wide rounded-xs",
        "transition-all duration-200",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-vntv-red]",
        isActive
          ? "bg-[--color-background] text-[--color-vntv-red] shadow-sm"
          : "text-[--color-foreground-muted] hover:text-[--color-foreground]",
        className
      )}
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(triggerValue)}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({
  className,
  value: contentValue,
  children,
  ...props
}: TabsContentProps) {
  const { value } = useTabsContext();

  if (value !== contentValue) return null;

  return (
    <div
      className={cn("mt-4", className)}
      role="tabpanel"
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
}
