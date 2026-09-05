import { notFound } from "next/navigation";
import { getVideo, getSuggestedVideos, type VideoData } from "@/app/actions/video";
import { VideoPagePlayer, VideoAnalyticsTracker } from "@/components/video";
import { VideoCard, ShareButtons } from "@/components/content";
import { PublicLayout } from "@/components/layout/public-layout";
import { CommentSection } from "@/components/comments/comment-section";
import { LikeButton } from "@/components/engagement/like-button";
import { createClient } from "@/lib/supabase/server";
import { Eye, Calendar, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";

interface VideoPageProps {
  params: Promise<{ slug: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { slug } = await params;
  const { data: video, error } = await getVideo(slug);

  if (error || !video) {
    notFound();
  }

  // Get suggested videos
  const { data: suggestedVideos } = await getSuggestedVideos(
    video.id,
    video.video_type,
    6
  );

  // Check if user has liked this video
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userHasLiked = false;
  if (user) {
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('content_type', 'video')
      .eq('content_id', video.id)
      .single();
    
    userHasLiked = !!existingLike;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const thumbnailUrl = video.thumbnail?.storage_path
    ? `${supabaseUrl}/storage/v1/object/public/media/${video.thumbnail.storage_path}`
    : undefined;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com";
  const videoUrl = `${siteUrl}/video/${video.slug}`;

  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <PublicLayout>
      {/* Analytics Tracker - tracks view count */}
      <VideoAnalyticsTracker videoId={video.id} />

      {/* JSON-LD Structured Data for Video */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: video.title,
            description: video.description || "",
            thumbnailUrl: thumbnailUrl ? [thumbnailUrl] : [],
            uploadDate: video.published_at,
            contentUrl: video.source_url,
            embedUrl: video.source_type === "youtube" ? video.source_url : undefined,
            duration: video.duration_seconds ? `PT${video.duration_seconds}S` : undefined,
            interactionStatistic: {
              "@type": "InteractionCounter",
              interactionType: { "@type": "WatchAction" },
              userInteractionCount: video.view_count,
            },
            publisher: {
              "@type": "Organization",
              name: "VNTV",
              logo: {
                "@type": "ImageObject",
                url: `${siteUrl}/logo.png`,
              },
            },
          }),
        }}
      />

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <VideoPagePlayer
              videoId={video.id}
              title={video.title}
              sourceType={video.source_type}
              sourceUrl={video.source_url}
              posterUrl={thumbnailUrl}
              gatingEnabled={true}
              className="w-full"
            />

            {/* Video Info */}
            <div className="mt-6">
              {/* Category Badge */}
              {video.category && (
                <div className="mb-4">
                  <span className="inline-block rounded bg-vntv-red px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                    {video.category.name}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4 leading-tight">
                {video.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{video.view_count.toLocaleString()} views</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDistanceToNow(new Date(video.published_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {video.duration_seconds && (
                  <>
                    <span>•</span>
                    <span>{formatDuration(video.duration_seconds)}</span>
                  </>
                )}
                <span>•</span>
                <LikeButton
                  contentType="video"
                  contentId={video.id}
                  initialLiked={userHasLiked}
                  initialLikeCount={video.like_count || 0}
                  size="sm"
                  showCount={true}
                />
              </div>

              {/* Description */}
              {video.description && (
                <div className="mb-8">
                  <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {video.description}
                  </p>
                </div>
              )}

              {/* Social Sharing */}
              <div className="mb-8">
                <ShareButtons
                  url={videoUrl}
                  title={video.title}
                  description={video.description || undefined}
                />
              </div>

              {/* Comments Section */}
              <CommentSection
                contentType="video"
                contentId={video.id}
                initialCommentCount={video.comment_count || 0}
              />
            </div>
          </div>

          {/* Sidebar - Suggested Videos */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <h2 className="flex items-center gap-3 text-base font-extrabold tracking-wide mb-6">
                <span className="w-1 h-4 bg-vntv-red rounded-sm" />
                RELATED VIDEOS
              </h2>

              {suggestedVideos && suggestedVideos.length > 0 ? (
                <div className="space-y-4">
                  {suggestedVideos.map((suggestedVideo) => (
                    <div key={suggestedVideo.id} className="transform transition-transform hover:scale-[1.02]">
                      <VideoCard
                        id={suggestedVideo.id}
                        title={suggestedVideo.title}
                        slug={suggestedVideo.slug}
                        description={suggestedVideo.description}
                        categoryName={suggestedVideo.category?.name}
                        thumbnailPath={suggestedVideo.thumbnail?.storage_path}
                        sourceType={suggestedVideo.source_type as "youtube" | "upload" | "external"}
                        sourceUrl={suggestedVideo.source_url}
                        durationSeconds={suggestedVideo.duration_seconds}
                        viewCount={suggestedVideo.view_count}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary text-sm">No related videos available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: video } = await getVideo(slug);

  if (!video) {
    return {
      title: "Video Not Found | VNTV",
      description: "The requested video could not be found.",
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com";
  
  const thumbnailUrl = video.thumbnail?.storage_path
    ? `${supabaseUrl}/storage/v1/object/public/media/${video.thumbnail.storage_path}`
    : null;

  const videoUrl = `${siteUrl}/video/${video.slug}`;

  return {
    title: `${video.title} | VNTV`,
    description: video.description || `Watch ${video.title} on VNTV - Africa's leading news and video platform`,
    
    keywords: video.category?.name,
    
    openGraph: {
      title: video.title,
      description: video.description || undefined,
      url: videoUrl,
      siteName: "VNTV",
      locale: "en_US",
      type: "video.other",
      images: thumbnailUrl
        ? [
            {
              url: thumbnailUrl,
              width: 1280,
              height: 720,
              alt: video.title,
            },
          ]
        : undefined,
      videos: [
        {
          url: video.source_url,
          secureUrl: video.source_url,
          type: "video/mp4",
          width: 1280,
          height: 720,
        },
      ],
    },
    
    twitter: {
      card: "player",
      site: "@vntv",
      title: video.title,
      description: video.description || undefined,
      images: thumbnailUrl ? [thumbnailUrl] : undefined,
      players: {
        playerUrl: videoUrl,
        streamUrl: video.source_url,
        width: 1280,
        height: 720,
      },
    },
    
    alternates: {
      canonical: videoUrl,
    },
  };
}
