import { forwardRef, SVGProps } from "react";
import { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * Icon wrapper component for consistent sizing
 * 
 * Usage:
 * <Icon as={Search} size="md" />
 */
export const Icon = forwardRef<
  SVGSVGElement,
  IconProps & { as: React.ComponentType<LucideProps> }
>(({ as: IconComponent, size = "md", className, ...props }, ref) => {
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  return (
    <IconComponent
      ref={ref}
      className={cn(sizes[size], className)}
      {...(props as LucideProps)}
    />
  );
});

Icon.displayName = "Icon";
