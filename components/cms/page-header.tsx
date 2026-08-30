import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode | {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-text-secondary">{description}</p>
        )}
      </div>
      {(action || children) && (
        <div className="flex items-center gap-3">
          {children}
          {action && (
            typeof action === 'object' && 'label' in action ? (
              action.href ? (
                <a href={action.href}>
                  <Button onClick={action.onClick}>
                    {action.icon && <action.icon className="h-4 w-4" />}
                    {action.label}
                  </Button>
                </a>
              ) : (
                <Button onClick={action.onClick}>
                  {action.icon && <action.icon className="h-4 w-4" />}
                  {action.label}
                </Button>
              )
            ) : (
              action
            )
          )}
        </div>
      )}
    </div>
  );
}
