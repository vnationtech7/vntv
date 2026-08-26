import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * Container component for consistent max-width layouts
 * 
 * Usage:
 * <Container size="lg">Content</Container>
 */
const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "xl", padding = "md", children, ...props }, ref) => {
    const sizes = {
      sm: "max-w-3xl",     // 768px
      md: "max-w-5xl",     // 1024px
      lg: "max-w-6xl",     // 1152px
      xl: "max-w-7xl",     // 1280px (VNTV default from mockup)
      full: "max-w-full",
    };

    const paddings = {
      none: "",
      sm: "px-4",
      md: "px-6 sm:px-8 md:px-12 lg:px-24",
      lg: "px-8 sm:px-12 md:px-16 lg:px-32",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full mx-auto",
          sizes[size],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export { Container };
