import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";

export interface ContentCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  authorName?: string | null;
  publishedAt?: string | null;
  imagePath?: string | null;
  imageUrl?: string | null; // Direct URL for RSS items
  imageAlt?: string | null;
  variant?: "default" | "horizontal" | "compact";
  contentType?: "article" | "rss";
  sourceName?: string | null; // For RSS items
}

export function ContentCard({
  id,
  title,
  slug,
  excerpt,
  categoryName,
  categorySlug,
  authorName,
  publishedAt,
  imagePath,
  imageUrl,
  imageAlt,
  variant = "default",
  contentType = "article",
  sourceName,
}: ContentCardProps) {
  const getImageUrl = (path: string) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // If path already includes bucket (like "media/..."), use as is
    // Otherwise, assume it's in the media bucket
    if (path.startsWith("media/") || path.startsWith("videos/")) {
      return `${supabaseUrl}/storage/v1/object/public/${path}`;
    }
    return `${supabaseUrl}/storage/v1/object/public/media/${path}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getReadTime = (text: string | null | undefined) => {
    if (!text) return "5 min read";
    const words = text.split(" ").length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  // Determine final image URL
  const finalImageUrl = imageUrl || (imagePath ? getImageUrl(imagePath) : null);

  // Determine link href based on content type
  const href = contentType === "rss" ? `/rss/${id}` : `/news/${slug}`;

  // Horizontal variant (for Latest News)
  if (variant === "horizontal") {
    return (
      <Link href={href} className="group block">
        <div className="flex gap-4 rounded-lg border border-border bg-background-panel p-4 transition-all hover:border-vntv-red hover:shadow-md">
          {/* Thumbnail */}
          {finalImageUrl && (
            <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded">
              <img
                src={finalImageUrl}
                alt={imageAlt || title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {contentType === "rss" && (
                <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-1">
                  <ExternalLink className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {categoryName && (
              <span className="mb-1 inline-block text-xs font-bold uppercase text-vntv-red">
                {categoryName}
              </span>
            )}
            {contentType === "rss" && sourceName && (
              <span className="mb-1 inline-block text-xs font-medium text-blue-600">
                {sourceName}
              </span>
            )}
            <h3 className="mb-2 line-clamp-2 text-base font-semibold text-text-primary group-hover:text-vntv-red transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              {authorName && <span>{authorName}</span>}
              {publishedAt && (
                <>
                  {authorName && <span>•</span>}
                  <span>{getTimeAgo(publishedAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Compact variant (for sidebar)
  if (variant === "compact") {
    return (
      <Link href={href} className="group block">
        <div className="flex gap-3 rounded-lg border border-border bg-background-panel p-3 transition-all hover:border-vntv-red hover:shadow-md">
          {finalImageUrl && (
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
              <img
                src={finalImageUrl}
                alt={imageAlt || title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {contentType === "rss" && (
                <div className="absolute top-1 right-1 bg-blue-600 rounded-full p-0.5">
                  <ExternalLink className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {categoryName && (
              <span className="mb-1 inline-block text-xs font-bold uppercase text-vntv-red">
                {categoryName}
              </span>
            )}
            {contentType === "rss" && sourceName && (
              <span className="mb-1 inline-block text-xs font-medium text-blue-600">
                {sourceName}
              </span>
            )}
            <h4 className="line-clamp-2 text-sm font-semibold text-text-primary group-hover:text-vntv-red transition-colors">
              {title}
            </h4>
            {publishedAt && (
              <p className="mt-1 text-xs text-text-tertiary">
                {getTimeAgo(publishedAt)}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Default variant (vertical card)
  return (
    <Link href={href} className="group block">
      <article className="overflow-hidden rounded-lg border border-border bg-background-panel transition-all hover:border-vntv-red hover:shadow-lg">
        {/* Image */}
        {finalImageUrl ? (
          <div className="relative aspect-[16/9] overflow-hidden bg-background-secondary">
            <img
              src={finalImageUrl}
              alt={imageAlt || title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {categoryName && (
              <div className="absolute left-3 top-3">
                <span className="inline-block rounded bg-vntv-red px-2 py-1 text-xs font-bold uppercase text-white">
                  {categoryName}
                </span>
              </div>
            )}
            {contentType === "rss" && (
              <div className="absolute top-3 right-3 bg-blue-600 rounded-full p-1.5">
                <ExternalLink className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="relative aspect-[16/9] bg-gradient-to-br from-background-secondary to-background flex items-center justify-center">
            <span className="text-2xl font-bold text-text-tertiary opacity-20">VNTV</span>
            {categoryName && (
              <div className="absolute left-3 top-3">
                <span className="inline-block rounded bg-vntv-red px-2 py-1 text-xs font-bold uppercase text-white">
                  {categoryName}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {contentType === "rss" && sourceName && (
            <span className="inline-block mb-1 text-xs font-medium text-blue-600">
              {sourceName}
            </span>
          )}
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-text-primary group-hover:text-vntv-red transition-colors">
            {title}
          </h3>

          {excerpt && (
            <p className="mb-3 line-clamp-2 text-sm text-text-secondary">
              {excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            {authorName && <span className="font-medium">{authorName}</span>}
            {publishedAt && (
              <>
                {authorName && <span>•</span>}
                <span>{getTimeAgo(publishedAt)}</span>
              </>
            )}
            {excerpt && contentType === "article" && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getReadTime(excerpt)}
                </span>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
