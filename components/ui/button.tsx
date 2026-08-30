import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "text";
  size?: "xs" | "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wide rounded-sm transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-vntv-red text-white hover:bg-vntv-red-hover focus-visible:outline-vntv-red",
      secondary:
        "bg-background-panel text-text-primary border border-border hover:bg-background-panel-2 focus-visible:outline-text-primary",
      ghost:
        "bg-transparent text-text-primary hover:bg-background-panel focus-visible:outline-text-primary",
      outline:
        "bg-transparent text-vntv-red border-2 border-vntv-red hover:bg-vntv-red-light focus-visible:outline-vntv-red",
      text: "bg-transparent text-text-secondary hover:text-vntv-red focus-visible:outline-vntv-red",
    };

    const sizes = {
      xs: "px-3 py-1.5 text-[10px]",
      sm: "px-4 py-2 text-[11px]",
      md: "px-5 py-2.5 text-[12px]",
      lg: "px-6 py-3 text-[13px]",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          loading && "opacity-70 cursor-wait",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
