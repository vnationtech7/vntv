import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "error" | "warning" | "info" | "category";
  size?: "sm" | "md";
  categoryColor?: string;
}

export function Badge({
  className,
  variant = "primary",
  size = "sm",
  categoryColor,
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1 font-extrabold uppercase tracking-wide rounded-xs";

  const variants = {
    primary: "bg-vntv-red-light text-vntv-red",
    secondary: "bg-background-panel-2 text-text-secondary",
    success: "bg-success-light text-success-dark",
    error: "bg-error-light text-error-dark",
    warning: "bg-warning-light text-warning-dark",
    info: "bg-info-light text-info-dark",
    category: "border-2 border-current bg-transparent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-[11px]",
  };

  const categoryStyle = categoryColor
    ? { color: categoryColor, borderColor: categoryColor }
    : undefined;

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      style={variant === "category" ? categoryStyle : undefined}
      {...props}
    >
      {children}
    </span>
  );
}
