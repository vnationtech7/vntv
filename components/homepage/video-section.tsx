"use client";

import { VideoCard } from "@/components/content";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface VideoSectionProps {
  videos: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    source_type: string;
    source_url: string;
    duration_seconds: number | null;
    view_count: number;
    category: { id: string; name: string; slug: string } | null;
    thumbnail: { id: string; storage_path: string; alt_text: string | null } | null;
  }>;
}

export function VideoSection({ videos }: VideoSectionProps) {
  console.log("VideoSection received videos:", JSON.stringify(videos, null, 2));
  
  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-3 text-base font-extrabold tracking-wide">
          <span className="w-1 h-4 bg-[--red] rounded-sm" />
          VNTV VIDEO
        </h2>
        <Link
          href="/videos"
          className="flex items-center gap-1 text-xs font-bold text-[--muted] hover:text-[--red] transition-colors"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            id={video.id}
            title={video.title}
            slug={video.slug}
            description={video.description}
            categoryName={video.category?.name}
            thumbnailPath={video.thumbnail?.storage_path}
            sourceType={video.source_type as "youtube" | "upload" | "external"}
            sourceUrl={video.source_url}
            durationSeconds={video.duration_seconds}
            viewCount={video.view_count}
          />
        ))}
      </div>
    </section>
  );
}
