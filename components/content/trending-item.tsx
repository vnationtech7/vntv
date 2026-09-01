import Link from "next/link";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";

export interface TrendingItemProps {
  id: string;
  title: string;
  slug: string;
  rank: number;
  publishedAt?: string | null;
  viewCount?: number;
  trending?: "up" | "down" | "stable";
  showBorder?: boolean;
  contentType?: "article" | "rss";
}

export function TrendingItem({
  id,
  title,
  slug,
  rank,
  publishedAt,
  viewCount,
  trending = "stable",
  contentType = "article",
}: TrendingItemProps) {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  // Determine link href based on content type
  const href = contentType === "rss" ? `/rss/${id}` : `/news/${slug}`;

  return (
    <Link href={href} className="group block">
      <div className="flex gap-3 py-3 border-b border-border last:border-0 transition-colors hover:bg-background-panel-2">
        {/* Rank Number */}
        <div className="flex-shrink-0">
          <span className="flex h-8 w-8 items-center justify-center text-2xl font-bold text-vntv-red/30">
            {rank.toString().padStart(2, "0")}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h4 className="mb-1 line-clamp-2 text-sm font-semibold text-text-primary group-hover:text-text-primary transition-colors flex-1">
              {title}
            </h4>
            {contentType === "rss" && (
              <ExternalLink className="w-3 h-3 text-text-secondary flex-shrink-0 mt-0.5" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            {publishedAt && <span>{getTimeAgo(publishedAt)}</span>}
            {viewCount !== undefined && viewCount > 0 && (
              <>
                {publishedAt && <span>•</span>}
                <span>{formatViewCount(viewCount)}</span>
              </>
            )}
          </div>
        </div>

        {/* Trending Indicator */}
        {trending !== "stable" && (
          <div className="flex-shrink-0">
            {trending === "up" ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
