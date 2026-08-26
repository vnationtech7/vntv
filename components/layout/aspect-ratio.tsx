import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  ratio?: "16/9" | "4/3" | "1/1" | "9/16" | "16/10" | number;
}

/**
 * AspectRatio component for maintaining consistent aspect ratios
 * 
 * Usage:
 * <AspectRatio ratio="16/9">
 *   <img src="..." alt="..." />
 * </AspectRatio>
 */
const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className, ratio = "16/9", children, style, ...props }, ref) => {
    const ratioClasses = {
      "16/9": "aspect-[16/9]",
      "4/3": "aspect-[4/3]",
      "1/1": "aspect-square",
      "9/16": "aspect-[9/16]",
      "16/10": "aspect-[16/10]",
    };

    const ratioClass =
      typeof ratio === "string"
        ? ratioClasses[ratio]
        : undefined;

    const ratioStyle =
      typeof ratio === "number"
        ? { aspectRatio: ratio.toString() }
        : undefined;

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          ratioClass,
          className
        )}
        style={{ ...ratioStyle, ...style }}
        {...props}
      >
        <div className="absolute inset-0">{children}</div>
      </div>
    );
  }
);

AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
