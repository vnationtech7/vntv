import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { getEpisodeBySlug, getProgrammeEpisodes } from "@/app/actions/episode";
import { VideoPagePlayer, VideoAnalyticsTracker } from "@/components/video";
import { ShareButtons } from "@/components/content";
import { Button } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, Play, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EpisodePageProps {
  params: Promise<{
    slug: string;
    episodeSlug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: EpisodePageProps): Promise<Metadata> {
  const { slug, episodeSlug } = await params;
  const { data: episode } = await getEpisodeBySlug(slug, episodeSlug);

  if (!episode) {
    return {
      title: "Episode Not Found | VNTV Originals",
      description: "The requested episode could not be found.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  const thumbnailUrl = episode.thumbnail
    ? `${supabaseUrl}/storage/v1/object/public/media/${episode.thumbnail.storage_path}`
    : null;

  const episodeUrl = `${siteUrl}/originals/${episode.programme?.slug}/${episode.slug}`;

  return {
    title: `${episode.title} - ${episode.programme?.name} | VNTV Originals`,
    description: episode.description || `Watch Episode ${episode.episode_number} of ${episode.programme?.name} on VNTV Originals`,
    
    openGraph: {
      title: `${episode.title} | ${episode.programme?.name}`,
      description: episode.description || undefined,
      url: episodeUrl,
      siteName: "VNTV Originals",
      type: "video.episode",
      images: thumbnailUrl
        ? [
            {
              url: thumbnailUrl,
              width: 1280,
              height: 720,
              alt: episode.title,
            },
          ]
        : undefined,
    },
    
    twitter: {
      card: "player",
      site: "@vntv",
      title: `${episode.title} | ${episode.programme?.name}`,
      description: episode.description || undefined,
      images: thumbnailUrl ? [thumbnailUrl] : undefined,
    },
    
    alternates: {
      canonical: episodeUrl,
    },
  };
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { slug, episodeSlug } = await params;
  
  const [episodeResult, allEpisodesResult] = await Promise.all([
    getEpisodeBySlug(slug, episodeSlug),
    // Get episode first to get programme ID, then get all episodes
    getEpisodeBySlug(slug, episodeSlug).then(async (result) => {
      if (result.data?.programme_id) {
        return await getProgrammeEpisodes(result.data.programme_id);
      }
      return { data: [], error: null };
    }),
  ]);

  if (episodeResult.error || !episodeResult.data) {
    notFound();
  }

  const episode = episodeResult.data;
  const allEpisodes = (allEpisodesResult.data || []).filter((ep) => ep.is_published);

  // Get related episodes (other episodes from same programme, excluding current)
  const relatedEpisodes = allEpisodes
    .filter((ep) => ep.id !== episode.id)
    .slice(0, 4);

  // Get next episode suggestion
  const currentIndex = allEpisodes.findIndex((ep) => ep.id === episode.id);
  const nextEpisode = currentIndex >= 0 && currentIndex < allEpisodes.length - 1
    ? allEpisodes[currentIndex + 1]
    : null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com";
  
  const thumbnailUrl = episode.thumbnail
    ? `${supabaseUrl}/storage/v1/object/public/media/${episode.thumbnail.storage_path}`
    : null;

  const episodeUrl = `${siteUrl}/originals/${episode.programme?.slug}/${episode.slug}`;

  // Check if episode has video
  if (!episode.video) {
    return (
      <PublicLayout>
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="text-center py-20">
            <p className="text-xl text-text-secondary mb-4">
              Video not available for this episode yet.
            </p>
            <Link href={`/originals/${episode.programme?.slug}`}>
              <Button variant="primary">
                Back to {episode.programme?.name}
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Analytics Tracker */}
      {episode.video && <VideoAnalyticsTracker videoId={episode.video.id} />}

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Back to Programme */}
        <div className="mb-6">
          <Link
            href={`/originals/${episode.programme?.slug}`}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-yellow transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {episode.programme?.name}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            {episode.video && (
              <VideoPagePlayer
                videoId={episode.video.id}
                title={episode.title}
                sourceType={episode.video.source_type}
                sourceUrl={episode.video.source_url}
                posterUrl={thumbnailUrl}
                gatingEnabled={true}
                className="w-full mb-6"
              />
            )}

            {/* Episode Info */}
            <div className="mb-6">
              {/* Programme Badge */}
              {episode.programme && (
                <div className="mb-3">
                  <Link
                    href={`/originals/${episode.programme.slug}`}
                    className="inline-block px-3 py-1 rounded bg-accent-yellow/10 text-accent-yellow text-sm font-bold hover:bg-accent-yellow/20 transition-colors"
                  >
                    {episode.programme.name}
                  </Link>
                </div>
              )}

              {/* Episode Number */}
              <p className="text-sm font-bold text-text-tertiary mb-2">
                Episode {episode.episode_number}
              </p>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4">
                {episode.title}
              </h1>

              {/* Meta Info */}
              {episode.published_at && (
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDistanceToNow(new Date(episode.published_at), { addSuffix: true })}
                  </span>
                </div>
              )}

              {/* Description */}
              {episode.description && (
                <div className="mb-8">
                  <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                    {episode.description}
                  </p>
                </div>
              )}

              {/* Social Sharing */}
              <div className="mb-8">
                <ShareButtons
                  url={episodeUrl}
                  title={`${episode.title} - ${episode.programme?.name}`}
                  description={episode.description || undefined}
                />
              </div>

              {/* Next Episode Suggestion */}
              {nextEpisode && (
                <div className="bg-surface-secondary rounded-lg border border-border p-6">
                  <h3 className="text-lg font-bold text-text-primary mb-4">
                    Up Next
                  </h3>
                  <Link
                    href={`/originals/${episode.programme?.slug}/${nextEpisode.slug}`}
                    className="flex gap-4 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="relative w-32 aspect-video rounded overflow-hidden bg-surface-tertiary">
                        {nextEpisode.thumbnail ? (
                          <Image
                            src={`${supabaseUrl}/storage/v1/object/public/media/${nextEpisode.thumbnail.storage_path}`}
                            alt={nextEpisode.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-sm font-bold text-text-tertiary">
                              EP {nextEpisode.episode_number}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-text-tertiary mb-1">
                        Episode {nextEpisode.episode_number}
                      </p>
                      <h4 className="text-base font-bold text-text-primary group-hover:text-accent-yellow transition-colors line-clamp-2">
                        {nextEpisode.title}
                      </h4>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Related Episodes */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <h2 className="text-lg font-bold text-text-primary mb-4">
                More Episodes
              </h2>

              {relatedEpisodes.length > 0 ? (
                <div className="space-y-4">
                  {relatedEpisodes.map((relatedEp) => {
                    const relatedThumbUrl = relatedEp.thumbnail
                      ? `${supabaseUrl}/storage/v1/object/public/media/${relatedEp.thumbnail.storage_path}`
                      : null;

                    return (
                      <Link
                        key={relatedEp.id}
                        href={`/originals/${episode.programme?.slug}/${relatedEp.slug}`}
                        className="flex gap-3 group"
                      >
                        <div className="flex-shrink-0">
                          <div className="relative w-28 aspect-video rounded overflow-hidden bg-surface-tertiary">
                            {relatedThumbUrl ? (
                              <Image
                                src={relatedThumbUrl}
                                alt={relatedEp.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-xs font-bold text-text-tertiary">
                                  EP {relatedEp.episode_number}
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-text-tertiary mb-1">
                            Episode {relatedEp.episode_number}
                          </p>
                          <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-yellow transition-colors line-clamp-2">
                            {relatedEp.title}
                          </h3>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">No other episodes available.</p>
              )}

              {/* View All Episodes */}
              {episode.programme && (
                <div className="mt-6">
                  <Link href={`/originals/${episode.programme.slug}`}>
                    <Button variant="outline" className="w-full">
                      View All Episodes
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
