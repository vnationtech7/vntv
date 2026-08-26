import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  background?: "default" | "panel" | "panel-2";
  fullWidth?: boolean;
}

/**
 * Section component for consistent vertical spacing
 * 
 * Usage:
 * <Section padding="lg">
 *   <h2>Section Title</h2>
 *   <p>Content</p>
 * </Section>
 */
const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      padding = "lg",
      background = "default",
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const paddingClasses = {
      none: "",
      sm: "py-8",
      md: "py-12",
      lg: "py-16",
      xl: "py-24",
    };

    const backgroundClasses = {
      default: "bg-[--color-background]",
      panel: "bg-[--color-background-panel]",
      "panel-2": "bg-[--color-background-panel-2]",
    };

    return (
      <section
        ref={ref}
        className={cn(
          paddingClasses[padding],
          backgroundClasses[background],
          !fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

/**
 * SectionHeader component for section titles
 */
export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-start justify-between mb-6", className)}
        {...props}
      >
        <div className="space-y-1">
          <h2 className="text-[15px] font-extrabold uppercase tracking-wide flex items-center gap-2">
            <span className="w-1 h-4 bg-[--color-vntv-red] rounded-sm" />
            {title}
          </h2>
          {description && (
            <p className="text-[13px] text-[--color-foreground-muted]">
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);

SectionHeader.displayName = "SectionHeader";

export { Section, SectionHeader };
