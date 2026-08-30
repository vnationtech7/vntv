import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicLayout } from "@/components/layout/public-layout";

interface VideoPageProps {
  params: {
    slug: string;
  };
}

async function getVideo(slug: string) {
  const supabase = await createClient();

  // Get video
  const { data: video, error }: { data: any; error: any } = await supabase
    .from("videos")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !video) {
    return null;
  }

  // Get thumbnail
  let thumbnail = null;
  if (video.thumbnail_id) {
    const { data: thumb } = await supabase
      .from("media_assets")
      .select("id, storage_path, alt_text")
      .eq("id", video.thumbnail_id)
      .single();
    thumbnail = thumb;
  }

  return {
    ...video,
    thumbnail,
  };
}

function getYouTubeEmbedUrl(url: string) {
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (videoIdMatch) {
    return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
  }
  return null;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { slug } = await params;
  const video = await getVideo(slug);

  if (!video) {
    notFound();
  }

  const publishedDate = video.published_at
    ? new Date(video.published_at)
    : new Date(video.created_at);

  // Determine video source
  let videoElement = null;
  if (video.source_type === "youtube" && video.source_url) {
    const embedUrl = getYouTubeEmbedUrl(video.source_url);
    if (embedUrl) {
      videoElement = (
        <iframe
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      );
    }
  } else if (video.source_type === "upload" && video.source_url) {
    const videoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${video.source_url}`;
    videoElement = (
      <video
        src={videoUrl}
        controls
        className="h-full w-full"
        poster={
          video.thumbnail
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${video.thumbnail.storage_path}`
            : undefined
        }
      >
        Your browser does not support the video tag.
      </video>
    );
  } else if (video.source_type === "embed" && video.embed_code) {
    videoElement = (
      <div dangerouslySetInnerHTML={{ __html: video.embed_code }} />
    );
  }

  return (
    <PublicLayout>
      <article className="mx-auto max-w-6xl px-6 py-12">
        {/* Video Type Badge */}
        {video.video_type && (
          <div className="mb-4">
            <span className="inline-block rounded bg-vntv-red px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
              {video.video_type}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="mb-6 text-4xl font-extrabold leading-tight text-text-primary md:text-5xl">
          {video.title}
        </h1>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          <time dateTime={publishedDate.toISOString()}>
            {publishedDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {video.duration_seconds && (
            <>
              <span>•</span>
              <span>
                {Math.floor(video.duration_seconds / 60)}:
                {(video.duration_seconds % 60).toString().padStart(2, "0")}
              </span>
            </>
          )}
          {video.view_count > 0 && (
            <>
              <span>•</span>
              <span>{video.view_count.toLocaleString()} views</span>
            </>
          )}
        </div>

        {/* Video Player */}
        <div className="mb-8 aspect-video overflow-hidden rounded-lg bg-black">
          {videoElement || (
            <div className="flex h-full items-center justify-center text-white">
              <p>Video not available</p>
            </div>
          )}
        </div>

        {/* Description */}
        {video.description && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold text-text-primary">
              Description
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed text-text-secondary">
              {video.description}
            </p>
          </div>
        )}

        {/* Video Details */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-text-secondary">
            Video Details
          </h3>
          <dl className="grid gap-4 md:grid-cols-2">
            {video.video_type && (
              <>
                <dt className="text-sm text-text-secondary">Type</dt>
                <dd className="text-sm font-medium text-text-primary">
                  {video.video_type}
                </dd>
              </>
            )}
            <dt className="text-sm text-text-secondary">Published</dt>
            <dd className="text-sm font-medium text-text-primary">
              {publishedDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </dd>
            {video.duration_seconds && (
              <>
                <dt className="text-sm text-text-secondary">Duration</dt>
                <dd className="text-sm font-medium text-text-primary">
                  {Math.floor(video.duration_seconds / 60)} minutes{" "}
                  {video.duration_seconds % 60} seconds
                </dd>
              </>
            )}
            <dt className="text-sm text-text-secondary">Views</dt>
            <dd className="text-sm font-medium text-text-primary">
              {video.view_count.toLocaleString()}
            </dd>
          </dl>
        </div>
      </article>
    </PublicLayout>
  );
}
