import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface SponsoredContentBadgeProps {
  label?: string | null;
  variant?: "inline" | "banner";
  className?: string;
}

/**
 * SponsoredContentBadge Component
 * Displays a sponsored content indicator with optional custom label
 * 
 * Usage:
 * <SponsoredContentBadge />
 * <SponsoredContentBadge label="Sponsored by Acme Corp" variant="banner" />
 */
export function SponsoredContentBadge({
  label,
  variant = "inline",
  className = "",
}: SponsoredContentBadgeProps) {
  if (variant === "banner" && label) {
    return (
      <div
        className={`rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-4 text-sm ${className}`}
      >
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-900 dark:text-amber-200 mb-1">
              Sponsored Content
            </div>
            <div className="text-amber-800 dark:text-amber-300">{label}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={`bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-300 dark:border-amber-700 ${className}`}
    >
      <Award className="w-3 h-3 mr-1" />
      {label || "Sponsored"}
    </Badge>
  );
}
