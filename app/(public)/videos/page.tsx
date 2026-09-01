// @ts-nocheck
import { PublicLayout } from "@/components/layout";
import { createClient } from "@/lib/supabase/server";
import { VideoCard } from "@/components/content";
import { Suspense } from "react";

export const metadata = {
  title: "Videos - VNTV",
  description: "Watch the latest videos from VNTV",
};

async function getVideosByCategory() {
  const supabase = await createClient();

  // Fetch all published videos
  const { data: videos, error: videosError } = await supabase
    .from("videos")
    .select("id, title, slug, description, source_type, source_url, duration_seconds, view_count, thumbnail_id, video_type")
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(50);

  if (videosError || !videos) {
    return { latest: [], byType: {} };
  }

  // Get thumbnails
  const thumbnailIds = videos.map(v => v.thumbnail_id).filter(Boolean);
  const { data: thumbnails } = thumbnailIds.length > 0
    ? await supabase.from("media_assets").select("id, storage_path, alt_text").in("id", thumbnailIds)
    : { data: [] };

  const thumbnailsMap = new Map(thumbnails?.map((t: any) => [t.id, t]) || []);

  // Enrich videos with thumbnails
  const enrichedVideos = videos.map(video => ({
    ...video,
    category: video.video_type ? { 
      id: video.video_type, 
      name: video.video_type.charAt(0).toUpperCase() + video.video_type.slice(1), 
      slug: video.video_type 
    } : null,
    thumbnail: video.thumbnail_id ? thumbnailsMap.get(video.thumbnail_id) || null : null,
  }));

  // Group by video_type
  const byType: Record<string, any[]> = {};
  enrichedVideos.forEach(video => {
    const type = video.video_type || 'other';
    if (!byType[type]) {
      byType[type] = [];
    }
    byType[type].push(video);
  });

  return {
    latest: enrichedVideos.slice(0, 12), // First 12 for hero section
    byType,
  };
}

export default async function VideosPage() {
  const { latest, byType } = await getVideosByCategory();

  // Define display order and labels for video types
  const typeLabels: Record<string, string> = {
    news: "News",
    breaking: "Breaking News",
    interview: "Interviews",
    documentary: "Documentaries",
    short: "Shorts",
    original: "VNTV Originals",
    standalone: "Featured",
  };

  const orderedTypes = ['news', 'breaking', 'interview', 'documentary', 'short', 'original', 'standalone'];

  return (
    <PublicLayout>
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-wide mb-2">
            <span className="w-1 h-6 bg-[--red] rounded-sm" />
            VNTV VIDEOS
          </h1>
          <p className="text-[--muted]">
            Watch the latest videos from across Africa
          </p>
        </div>

        {/* Latest Videos - Netflix Hero Grid (10-12 items, 4 per row) */}
        {latest.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">Latest Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {latest.map((video) => (
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
        )}

        {/* Videos by Type - Netflix-style Sections */}
        {orderedTypes.map(type => {
          const videos = byType[type];
          if (!videos || videos.length === 0) return null;

          return (
            <section key={type} className="mb-12">
              <h2 className="text-xl font-bold mb-4">{typeLabels[type] || type}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
        })}

        {/* Empty State */}
        {latest.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[--muted-2]">No videos available at the moment.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
