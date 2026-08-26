import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  wrap?: boolean;
  direction?: "row" | "row-reverse" | "col" | "col-reverse";
}

/**
 * Flex component - Low-level flexbox utility
 * For most cases, use Stack, HStack, or VStack instead
 */
const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      align,
      justify,
      gap = "none",
      wrap = false,
      direction = "row",
      children,
      ...props
    },
    ref
  ) => {
    const alignClasses = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    };

    const justifyClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    };

    const gapClasses = {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    };

    const directionClasses = {
      row: "flex-row",
      "row-reverse": "flex-row-reverse",
      col: "flex-col",
      "col-reverse": "flex-col-reverse",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          directionClasses[direction],
          align && alignClasses[align],
          justify && justifyClasses[justify],
          gapClasses[gap],
          wrap && "flex-wrap",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = "Flex";

/**
 * Spacer component - Flexible spacer for flex layouts
 */
const Spacer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1", className)}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Spacer.displayName = "Spacer";

/**
 * Center component - Centers content both horizontally and vertically
 */
export interface CenterProps extends HTMLAttributes<HTMLDivElement> {
  inline?: boolean;
}

const Center = forwardRef<HTMLDivElement, CenterProps>(
  ({ className, inline = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          inline ? "inline-flex" : "flex",
          "items-center justify-center",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Center.displayName = "Center";

export { Flex, Spacer, Center };
