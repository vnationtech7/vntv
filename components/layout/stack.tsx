import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  wrap?: boolean;
}

/**
 * Stack component for flexible layouts (Flexbox)
 * 
 * Usage:
 * <Stack direction="row" gap="md" align="center">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Stack>
 */
const Stack = forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      direction = "column",
      align = "stretch",
      justify = "start",
      gap = "md",
      wrap = false,
      children,
      ...props
    },
    ref
  ) => {
    const directionClasses = {
      row: "flex-row",
      column: "flex-col",
    };

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
      "2xl": "gap-12",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          directionClasses[direction],
          alignClasses[align],
          justifyClasses[justify],
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

Stack.displayName = "Stack";

/**
 * HStack - Horizontal stack (row)
 */
export interface HStackProps extends Omit<StackProps, "direction"> {}

const HStack = forwardRef<HTMLDivElement, HStackProps>((props, ref) => {
  return <Stack ref={ref} direction="row" {...props} />;
});

HStack.displayName = "HStack";

/**
 * VStack - Vertical stack (column)
 */
export interface VStackProps extends Omit<StackProps, "direction"> {}

const VStack = forwardRef<HTMLDivElement, VStackProps>((props, ref) => {
  return <Stack ref={ref} direction="column" {...props} />;
});

VStack.displayName = "VStack";

export { Stack, HStack, VStack };
