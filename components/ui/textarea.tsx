import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      fullWidth = false,
      id,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-[12px] font-bold tracking-wide text-[--color-foreground]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(
            "px-4 py-2.5 bg-[--color-background-panel] border border-[--color-border] rounded-sm",
            "text-[14px] text-[--color-foreground] placeholder:text-[--color-foreground-muted]",
            "focus:outline-none focus:ring-2 focus:ring-[--color-vntv-red] focus:border-transparent",
            "transition-all duration-200 resize-vertical",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-[--color-error] focus:ring-[--color-error]",
            fullWidth && "w-full",
            className
          )}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error
              ? `${textareaId}-error`
              : hint
              ? `${textareaId}-hint`
              : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-[11px] text-[--color-error]"
            role="alert"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={`${textareaId}-hint`}
            className="text-[11px] text-[--color-foreground-muted]"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
