import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 12;
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  responsive?: boolean;
}

/**
 * Grid component for consistent grid layouts
 * 
 * Usage:
 * <Grid cols={4} gap="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Grid>
 */
const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      className,
      cols = 1,
      gap = "md",
      responsive = true,
      children,
      ...props
    },
    ref
  ) => {
    // Column classes
    const columnClasses = {
      1: "grid-cols-1",
      2: responsive ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2",
      3: responsive ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-3",
      4: responsive ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-4",
      5: responsive ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5" : "grid-cols-5",
      6: responsive ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" : "grid-cols-6",
      8: responsive ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8" : "grid-cols-8",
      12: responsive ? "grid-cols-4 sm:grid-cols-6 lg:grid-cols-12" : "grid-cols-12",
    };

    // Gap classes
    const gapClasses = {
      none: "gap-0",
      xs: "gap-2",
      sm: "gap-4",
      md: "gap-6",
      lg: "gap-8",
      xl: "gap-12",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          columnClasses[cols],
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

/**
 * GridItem component for explicit grid positioning
 */
export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6 | "full";
}

const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, rowSpan, children, ...props }, ref) => {
    const colSpanClasses = {
      1: "col-span-1",
      2: "col-span-2",
      3: "col-span-3",
      4: "col-span-4",
      5: "col-span-5",
      6: "col-span-6",
      7: "col-span-7",
      8: "col-span-8",
      9: "col-span-9",
      10: "col-span-10",
      11: "col-span-11",
      12: "col-span-12",
      full: "col-span-full",
    };

    const rowSpanClasses = {
      1: "row-span-1",
      2: "row-span-2",
      3: "row-span-3",
      4: "row-span-4",
      5: "row-span-5",
      6: "row-span-6",
      full: "row-span-full",
    };

    return (
      <div
        ref={ref}
        className={cn(
          colSpan && colSpanClasses[colSpan],
          rowSpan && rowSpanClasses[rowSpan],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridItem.displayName = "GridItem";

export { Grid, GridItem };
