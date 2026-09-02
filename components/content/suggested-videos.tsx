"use client";

import { VideoCard } from "./video-card";

interface SuggestedVideosProps {
  videos: Array<{
    id: string;
    title: string;
    slug: string;
    source_type: string;
    source_url: string;
    duration_seconds: number | null;
    view_count: number;
    published_at: string;
    video_type?: string;
    thumbnail?: {
      storage_path: string;
      alt_text?: string;
    } | null;
    category?: {
      name: string;
      slug: string;
    } | null;
  }>;
  title?: string;
  className?: string;
}

export function SuggestedVideos({
  videos,
  title = "Suggested Videos",
  className = "",
}: SuggestedVideosProps) {
  if (!videos || videos.length === 0) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <div className={className}>
      <h2 className="flex items-center gap-3 text-base font-extrabold tracking-wide mb-6">
        <span className="w-1 h-4 bg-[--red] rounded-sm" />
        {title.toUpperCase()}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {videos.map((video) => {
          return (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              slug={video.slug}
              sourceType={video.source_type as "youtube" | "upload" | "external"}
              sourceUrl={video.source_url}
              thumbnailPath={video.thumbnail?.storage_path}
              durationSeconds={video.duration_seconds}
              viewCount={video.view_count}
              categoryName={video.category?.name}
            />
          );
        })}
      </div>
    </div>
  );
}
