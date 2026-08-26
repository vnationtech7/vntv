import { HTMLAttributes, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function Avatar({
  className,
  size = "md",
  children,
  ...props
}: AvatarProps) {
  const sizes = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[--color-background-panel-2]",
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {}

export function AvatarImage({ className, alt, ...props }: AvatarImageProps) {
  return (
    <img
      className={cn("h-full w-full object-cover", className)}
      alt={alt}
      {...props}
    />
  );
}

export interface AvatarFallbackProps
  extends HTMLAttributes<HTMLDivElement> {}

export function AvatarFallback({
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-[--color-background-panel-2] text-[--color-foreground-muted] font-bold text-[12px] uppercase",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
