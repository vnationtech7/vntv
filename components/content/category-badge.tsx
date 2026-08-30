import Link from "next/link";

export interface CategoryBadgeProps {
  name: string;
  slug?: string;
  variant?: "default" | "outline" | "solid";
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
}

const categoryColors: Record<string, string> = {
  ghana: "bg-red-600 text-white",
  nigeria: "bg-yellow-600 text-white",
  africa: "bg-green-600 text-white",
  world: "bg-blue-600 text-white",
  politics: "bg-purple-600 text-white",
  business: "bg-pink-600 text-white",
  entertainment: "bg-fuchsia-600 text-white",
  sports: "bg-indigo-600 text-white",
  viral: "bg-orange-600 text-white",
  opinion: "bg-teal-600 text-white",
  breaking: "bg-vntv-red text-white",
};

export function CategoryBadge({
  name,
  slug,
  variant = "default",
  size = "sm",
  clickable = true,
}: CategoryBadgeProps) {
  const normalizedName = name.toLowerCase().replace(/\s+/g, "-");
  const colorClass = categoryColors[normalizedName] || "bg-text-tertiary text-white";

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const variantClasses = {
    default: colorClass,
    outline: `border-2 ${colorClass.replace("bg-", "border-").replace("text-white", "")} bg-transparent`,
    solid: colorClass,
  };

  const className = `inline-flex items-center rounded font-bold uppercase tracking-wide transition-opacity ${sizeClasses[size]} ${variantClasses[variant]} ${clickable ? "hover:opacity-80" : ""}`;

  if (clickable && slug) {
    return (
      <Link href={`/category/${slug}`} className={className}>
        {name}
      </Link>
    );
  }

  return <span className={className}>{name}</span>;
}
