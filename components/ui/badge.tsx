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
    primary: "bg-[--color-vntv-red-light] text-[--color-vntv-red]",
    secondary: "bg-[--color-background-panel-2] text-[--color-foreground-muted]",
    success: "bg-[--color-success-light] text-[--color-success-dark]",
    error: "bg-[--color-error-light] text-[--color-error-dark]",
    warning: "bg-[--color-warning-light] text-[--color-warning-dark]",
    info: "bg-[--color-info-light] text-[--color-info-dark]",
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
