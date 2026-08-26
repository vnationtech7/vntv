/**
 * Category Icons for VNTV
 * 
 * Custom icons that match category colors from the design system
 */

import { LucideIcon } from "lucide-react";
import {
  MapPin,
  Globe,
  Building2,
  Briefcase,
  Trophy,
  Film,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CategoryIconProps {
  className?: string;
  size?: number;
}

// Category to icon mapping
export const categoryIconMap: Record<string, LucideIcon> = {
  ghana: MapPin,
  nigeria: MapPin,
  africa: Globe,
  world: Globe,
  politics: Building2,
  business: Briefcase,
  entertainment: Film,
  sports: Trophy,
  viral: TrendingUp,
  opinion: Target,
  video: Film,
  originals: Film,
};

// Category to color mapping (from design system)
export const categoryColorMap: Record<string, string> = {
  ghana: "#e31c23",
  nigeria: "#f5a623",
  africa: "#2fbf6f",
  world: "#4a90e2",
  politics: "#9013fe",
  business: "#f08bb4",
  entertainment: "#e0142c",
  sports: "#5856d6",
};

/**
 * Get icon component for a category
 */
export function getCategoryIcon(category: string): LucideIcon {
  const normalized = category.toLowerCase();
  return categoryIconMap[normalized] || Globe;
}

/**
 * Get color for a category
 */
export function getCategoryColor(category: string): string {
  const normalized = category.toLowerCase();
  return categoryColorMap[normalized] || "#e0142c";
}

/**
 * CategoryIcon component with automatic color
 */
export function CategoryIcon({
  category,
  className,
  size = 20,
}: CategoryIconProps & { category: string }) {
  const IconComponent = getCategoryIcon(category);
  const color = getCategoryColor(category);

  return (
    <IconComponent
      className={cn("flex-shrink-0", className)}
      size={size}
      style={{ color }}
      aria-hidden="true"
    />
  );
}

/**
 * CategoryIconCircle - Icon in a circular badge
 */
export function CategoryIconCircle({
  category,
  className,
  size = 48,
}: CategoryIconProps & { category: string }) {
  const IconComponent = getCategoryIcon(category);
  const color = getCategoryColor(category);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-2",
        className
      )}
      style={{
        width: size,
        height: size,
        borderColor: color,
        color: color,
      }}
    >
      <IconComponent size={size * 0.5} aria-hidden="true" />
    </div>
  );
}
