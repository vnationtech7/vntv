import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
  spacing?: "none" | "sm" | "md" | "lg";
  label?: string;
}

/**
 * Divider component for visual separation
 * 
 * Usage:
 * <Divider />
 * <Divider label="OR" />
 * <Divider orientation="vertical" />
 */
const Divider = forwardRef<HTMLHRElement, DividerProps>(
  (
    {
      className,
      orientation = "horizontal",
      spacing = "md",
      label,
      ...props
    },
    ref
  ) => {
    const spacingClasses = {
      horizontal: {
        none: "",
        sm: "my-2",
        md: "my-4",
        lg: "my-8",
      },
      vertical: {
        none: "",
        sm: "mx-2",
        md: "mx-4",
        lg: "mx-8",
      },
    };

    if (label) {
      return (
        <div
          className={cn(
            "relative flex items-center",
            spacingClasses.horizontal[spacing],
            className
          )}
          role="separator"
          aria-label={label}
        >
          <div className="flex-1 border-t border-[--color-border]" />
          <span className="px-3 text-[11px] font-bold uppercase tracking-wide text-[--color-foreground-muted]">
            {label}
          </span>
          <div className="flex-1 border-t border-[--color-border]" />
        </div>
      );
    }

    if (orientation === "vertical") {
      return (
        <hr
          ref={ref}
          className={cn(
            "inline-block h-full w-px bg-[--color-border] border-0",
            spacingClasses.vertical[spacing],
            className
          )}
          role="separator"
          aria-orientation="vertical"
          {...props}
        />
      );
    }

    return (
      <hr
        ref={ref}
        className={cn(
          "w-full border-0 border-t border-[--color-border]",
          spacingClasses.horizontal[spacing],
          className
        )}
        role="separator"
        aria-orientation="horizontal"
        {...props}
      />
    );
  }
);

Divider.displayName = "Divider";

export { Divider };
