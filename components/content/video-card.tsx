import Link from "next/link";
import { Play } from "lucide-react";

export interface VideoCardProps {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  categoryName?: string | null;
  thumbnailPath?: string | null;
  sourceType: "youtube" | "upload" | "external";
  sourceUrl?: string | null;
  durationSeconds?: number | null;
  viewCount?: number;
}

export function VideoCard({
  title,
  slug,
  description,
  categoryName,
  thumbnailPath,
  sourceType,
  sourceUrl,
  durationSeconds,
  viewCount,
}: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match?.[1] || null;
  };

  const getYouTubeThumbnail = (videoId: string, quality: 'hq' | 'mq' | 'sd' = 'hq') => {
    const qualityMap = {
      hq: 'maxresdefault',
      mq: 'hqdefault',
      sd: 'sddefault'
    };
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
  };

  /**
   * Get thumbnail URL with priority:
   * 1. Custom uploaded thumbnail (from storage_path)
   * 2. YouTube thumbnail (for YouTube videos)
   * 3. null (will show video element or placeholder)
   */
  const getThumbnail = (): string | null => {
    // Priority 1: Custom thumbnail from media_assets
    if (thumbnailPath) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const bucket = "media"; // Thumbnails are stored in media bucket
      return `${supabaseUrl}/storage/v1/object/public/${bucket}/${thumbnailPath}`;
    }
    
    // Priority 2: YouTube thumbnail
    if (sourceType === "youtube" && sourceUrl) {
      const videoId = extractYouTubeId(sourceUrl);
      if (videoId) {
        return getYouTubeThumbnail(videoId, "hq");
      }
    }
    
    // Priority 3: No thumbnail - will show video element or placeholder
    return null;
  };

  const thumbnailUrl = getThumbnail();

  return (
    <Link href={`/video/${slug}`} className="group block">
      <article className="overflow-hidden rounded-lg border border-border bg-background-panel transition-all hover:border-vntv-red hover:shadow-lg">
        {/* Thumbnail with Play Overlay */}
        <div className="relative aspect-video overflow-hidden bg-background-secondary">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : sourceType === "upload" && sourceUrl ? (
            // For uploaded videos without thumbnail, show video frame
            <video
              src={sourceUrl}
              className="h-full w-full object-cover pointer-events-none"
              preload="metadata"
              muted
              playsInline
            />
          ) : (
            // Placeholder for videos with no thumbnail
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-background-secondary to-background">
              <Play className="h-16 w-16 text-text-tertiary opacity-20" />
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-vntv-red text-white shadow-lg">
              <Play className="h-8 w-8 fill-current" />
            </div>
          </div>

          {/* Category Badge */}
          {categoryName && (
            <div className="absolute left-3 top-3">
              <span className="inline-block rounded bg-vntv-red px-2 py-1 text-xs font-bold uppercase text-white">
                {categoryName}
              </span>
            </div>
          )}

          {/* Duration Badge */}
          {durationSeconds && (
            <div className="absolute bottom-3 right-3">
              <span className="inline-block rounded bg-black/80 px-2 py-1 text-xs font-bold text-white">
                {formatDuration(durationSeconds)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-2 line-clamp-2 text-base font-bold text-text-primary group-hover:text-vntv-red transition-colors">
            {title}
          </h3>

          {description && (
            <p className="mb-3 line-clamp-2 text-sm text-text-secondary">
              {description}
            </p>
          )}

          {/* Meta */}
          {viewCount !== undefined && (
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <Play className="h-3 w-3" />
              <span>{formatViewCount(viewCount)} views</span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
