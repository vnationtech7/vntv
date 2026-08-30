import Link from "next/link";
import {
  Globe2,
  Flag,
  Globe,
  Building2,
  Landmark,
  TrendingUp,
  Tv,
  Trophy,
} from "lucide-react";

// Category configuration with icons and descriptions
const CATEGORIES = [
  {
    name: "Ghana",
    slug: "ghana",
    icon: Flag,
    description: "Stories from Ghana",
    color: "#e0142c",
  },
  {
    name: "Nigeria",
    slug: "nigeria",
    icon: Flag,
    description: "News from Nigeria",
    color: "#2fbf6f",
  },
  {
    name: "Africa",
    slug: "africa",
    icon: Globe2,
    description: "Pan-African news",
    color: "#f59e0b",
  },
  {
    name: "World",
    slug: "world",
    icon: Globe,
    description: "International news",
    color: "#3b82f6",
  },
  {
    name: "Politics",
    slug: "politics",
    icon: Landmark,
    description: "Political coverage",
    color: "#8b5cf6",
  },
  {
    name: "Business",
    slug: "business",
    icon: TrendingUp,
    description: "Business & economy",
    color: "#10b981",
  },
  {
    name: "Entertainment",
    slug: "entertainment",
    icon: Tv,
    description: "Culture & lifestyle",
    color: "#ec4899",
  },
  {
    name: "Sports",
    slug: "sports",
    icon: Trophy,
    description: "Sports updates",
    color: "#f97316",
  },
];

export function CategoryStrip() {
  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="flex items-center gap-3 text-base font-extrabold tracking-wide">
          <span className="w-1 h-4 bg-[--red] rounded-sm" />
          EXPLORE BY CATEGORY
        </h2>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {CATEGORIES.map((category) => {
          const IconComponent = category.icon;
          return (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group bg-[--panel] border border-[--border] rounded-lg p-5 text-center transition-transform hover:-translate-y-1"
            >
              {/* Icon Circle */}
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center border-2 transition-colors"
                style={{
                  borderColor: category.color,
                  color: category.color,
                }}
              >
                <IconComponent className="w-5 h-5" />
              </div>

              {/* Category Name */}
              <h4 className="text-[13px] font-extrabold mb-1.5 group-hover:text-[--red] transition-colors">
                {category.name}
              </h4>

              {/* Description */}
              <p className="text-[10.5px] text-[--muted-2] leading-snug">
                {category.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
