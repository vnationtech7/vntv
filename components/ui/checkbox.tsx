import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: ReactNode;
  error?: string;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, disabled, onCheckedChange, onChange, ...props }, ref) => {
    const checkboxId = id || (typeof label === "string" ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Call the standard onChange if provided
      onChange?.(e);
      // Call the custom onCheckedChange if provided
      onCheckedChange?.(e.target.checked);
    };

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="relative inline-flex">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className={cn(
                "peer h-5 w-5 appearance-none rounded-xs border-2 border-border",
                "bg-background-panel",
                "checked:bg-vntv-red checked:border-vntv-red",
                "focus:outline-none focus:ring-2 focus:ring-vntv-red focus:ring-offset-2",
                "transition-all duration-200 cursor-pointer",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                error && "border-error",
                className
              )}
              disabled={disabled}
              onChange={handleChange}
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
                "text-[14px] text-text-primary cursor-pointer select-none",
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
            className="text-[11px] text-error ml-7"
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
