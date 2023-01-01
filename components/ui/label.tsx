import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function Label({ className = "", ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-text-primary mb-1 ${className}`}
      {...props}
    />
  );
}
