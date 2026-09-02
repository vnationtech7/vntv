// @ts-nocheck
import { PublicLayout } from "@/components/layout";
import { createClient } from "@/lib/supabase/server";
import { VideoCard } from "@/components/content";
import { Button } from "@/components/ui";
import Link from "next/link";
import { Suspense } from "react";

interface VideosPageProps {
  searchParams: Promise<{
    type?: "short" | "news" | "documentary" | "interview" | "vlog" | "breaking" | "original" | "standalone";
    sort?: "latest" | "trending" | "popular";
    page?: string;
  }>;
}

export const metadata = {
  title: "Videos - Watch Latest News & Content | VNTV",
  description: "Watch the latest videos, shorts, news coverage, documentaries and interviews from VNTV - Africa's leading news platform",
};

async function getVideosByCategory(filters: {
  type?: string;
  sort?: string;
  page: number;
  limit: number;
}) {
  const supabase = await createClient();
  const { type, sort = "latest", page, limit } = filters;
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from("videos")
    .select("id, title, slug, description, source_type, source_url, duration_seconds, view_count, thumbnail_id, video_type", { count: "exact" })
    .eq("status", "published")
    .not("published_at", "is", null);

  // Filter by type if provided
  if (type) {
    query = query.eq("video_type", type);
  }

  // Sort
  switch (sort) {
    case "trending":
    case "popular":
      query = query.order("view_count", { ascending: false });
      break;
    case "latest":
    default:
      query = query.order("published_at", { ascending: false });
      break;
  }

  // Pagination
  query = query.range(offset, offset + limit - 1);

  const { data: videos, error: videosError, count } = await query;

  if (videosError || !videos) {
    return { videos: [], total: 0 };
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

  return {
    videos: enrichedVideos,
    total: count || 0,
  };
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const { type, sort = "latest", page = "1" } = await searchParams;
  const currentPage = parseInt(page, 10) || 1;
  const limit = 24;

  const { videos, total } = await getVideosByCategory({
    type,
    sort,
    page: currentPage,
    limit,
  });

  const totalPages = Math.ceil(total / limit);

  // Get type display name
  const getTypeDisplayName = (t?: string) => {
    switch (t) {
      case "short":
        return "Shorts";
      case "news":
        return "News Videos";
      case "breaking":
        return "Breaking News";
      case "documentary":
        return "Documentaries";
      case "interview":
        return "Interviews";
      case "vlog":
        return "Vlogs";
      case "original":
        return "VNTV Originals";
      case "standalone":
        return "Featured";
      default:
        return "All Videos";
    }
  };

  const pageTitle = getTypeDisplayName(type);

  return (
    <PublicLayout>
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            {pageTitle}
          </h1>
          <p className="text-xl text-text-secondary">
            {type
              ? `Watch our latest ${getTypeDisplayName(type).toLowerCase()}`
              : "Browse all videos from VNTV"}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <Link href="/videos">
              <Button variant={!type ? "primary" : "outline"} size="sm">
                All Videos
              </Button>
            </Link>
            <Link href="/videos?type=short">
              <Button variant={type === "short" ? "primary" : "outline"} size="sm">
                Shorts
              </Button>
            </Link>
            <Link href="/videos?type=news">
              <Button variant={type === "news" ? "primary" : "outline"} size="sm">
                News
              </Button>
            </Link>
            <Link href="/videos?type=breaking">
              <Button variant={type === "breaking" ? "primary" : "outline"} size="sm">
                Breaking
              </Button>
            </Link>
            <Link href="/videos?type=documentary">
              <Button variant={type === "documentary" ? "primary" : "outline"} size="sm">
                Documentaries
              </Button>
            </Link>
            <Link href="/videos?type=interview">
              <Button variant={type === "interview" ? "primary" : "outline"} size="sm">
                Interviews
              </Button>
            </Link>
            <Link href="/videos?type=vlog">
              <Button variant={type === "vlog" ? "primary" : "outline"} size="sm">
                Vlogs
              </Button>
            </Link>
            <Link href="/videos?type=original">
              <Button variant={type === "original" ? "primary" : "outline"} size="sm">
                Originals
              </Button>
            </Link>
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <Link href={`/videos${type ? `?type=${type}` : ""}`}>
              <Button variant={sort === "latest" ? "primary" : "outline"} size="sm">
                Latest
              </Button>
            </Link>
            <Link href={`/videos?sort=trending${type ? `&type=${type}` : ""}`}>
              <Button variant={sort === "trending" ? "primary" : "outline"} size="sm">
                Trending
              </Button>
            </Link>
            <Link href={`/videos?sort=popular${type ? `&type=${type}` : ""}`}>
              <Button variant={sort === "popular" ? "primary" : "outline"} size="sm">
                Most Viewed
              </Button>
            </Link>
          </div>
        </div>

        {/* Videos Grid */}
        {videos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-12">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/videos?page=${currentPage - 1}${type ? `&type=${type}` : ""}${sort !== "latest" ? `&sort=${sort}` : ""}`}
                  >
                    <Button variant="outline">Previous</Button>
                  </Link>
                )}

                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-text-secondary">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                {currentPage < totalPages && (
                  <Link
                    href={`/videos?page=${currentPage + 1}${type ? `&type=${type}` : ""}${sort !== "latest" ? `&sort=${sort}` : ""}`}
                  >
                    <Button variant="outline">Next</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-text-secondary mb-4">
              No videos found{type ? ` in ${getTypeDisplayName(type)}` : ""}.
            </p>
            <Link href="/videos">
              <Button>View All Videos</Button>
            </Link>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
