import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, disabled, ...props }, ref) => {
    const checkboxId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="relative inline-flex">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className={cn(
                "peer h-5 w-5 appearance-none rounded-xs border-2 border-[--color-border]",
                "bg-[--color-background-panel]",
                "checked:bg-[--color-vntv-red] checked:border-[--color-vntv-red]",
                "focus:outline-none focus:ring-2 focus:ring-[--color-vntv-red] focus:ring-offset-2",
                "transition-all duration-200 cursor-pointer",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                error && "border-[--color-error]",
                className
              )}
              disabled={disabled}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? `${checkboxId}-error` : undefined}
              {...props}
            />
            {/* Check icon */}
            <svg
              className="absolute inset-0 w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                "text-[14px] text-[--color-foreground] cursor-pointer select-none",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p
            id={`${checkboxId}-error`}
            className="text-[11px] text-[--color-error] ml-7"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
