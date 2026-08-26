"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  HTMLAttributes,
  ButtonHTMLAttributes,
  cloneElement,
  isValidElement,
} from "react";
import { cn } from "@/lib/utils";

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog components must be used within a Dialog");
  }
  return context;
}

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, setOpen]);

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export interface DialogTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function DialogTrigger({ children, onClick, asChild, ...props }: DialogTriggerProps) {
  const { setOpen } = useDialogContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(true);
    onClick?.(e);
  };

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        handleClick(e);
        // @ts-ignore - Call original onClick if it exists
        children.props.onClick?.(e);
      },
    } as any);
  }

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function DialogContent({
  className,
  size = "md",
  children,
  ...props
}: DialogContentProps) {
  const { open, setOpen } = useDialogContext();

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 animate-fade-in"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className={cn(
          "relative w-full bg-[--color-background] border border-[--color-border] rounded-md shadow-xl animate-scale-in",
          "max-h-[90vh] overflow-auto",
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function DialogHeader({ className, children, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 p-6 pb-4 border-b border-[--color-border]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DialogTitleProps
  extends HTMLAttributes<HTMLHeadingElement> {}

export function DialogTitle({ className, children, ...props }: DialogTitleProps) {
  return (
    <h2
      className={cn("text-[20px] font-bold leading-tight", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export interface DialogDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement> {}

export function DialogDescription({
  className,
  children,
  ...props
}: DialogDescriptionProps) {
  return (
    <p
      className={cn("text-[13px] text-[--color-foreground-muted]", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export interface DialogBodyProps extends HTMLAttributes<HTMLDivElement> {}

export function DialogBody({ className, children, ...props }: DialogBodyProps) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function DialogFooter({ className, children, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 p-6 pt-4 border-t border-[--color-border]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DialogCloseProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function DialogClose({ children, onClick, asChild, ...props }: DialogCloseProps) {
  const { setOpen } = useDialogContext();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(false);
    onClick?.(e);
  };

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        handleClick(e);
        // @ts-ignore - Call original onClick if it exists
        children.props.onClick?.(e);
      },
    } as any);
  }

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
