import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layout/public-layout";
import { getProgrammeBySlug } from "@/app/actions/programme";
import { getProgrammeEpisodes } from "@/app/actions/episode";
import { Button } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Play, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProgrammePageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProgrammePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: programme } = await getProgrammeBySlug(slug);

  if (!programme) {
    return {
      title: "Programme Not Found | VNTV Originals",
      description: "The requested programme could not be found.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vntv.com";
  const posterUrl = programme.poster_image
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${programme.poster_image.storage_path}`
    : null;

  return {
    title: `${programme.name} | VNTV Originals`,
    description: programme.description || `Watch ${programme.name} on VNTV Originals - Africa's leading original content platform`,
    
    keywords: programme.programme_type,
    
    openGraph: {
      title: `${programme.name} | VNTV Originals`,
      description: programme.description || undefined,
      url: `${siteUrl}/originals/${programme.slug}`,
      siteName: "VNTV Originals",
      type: "website",
      images: posterUrl
        ? [
            {
              url: posterUrl,
              width: 1920,
              height: 1080,
              alt: programme.name,
            },
          ]
        : undefined,
    },
    
    twitter: {
      card: "summary_large_image",
      site: "@vntv",
      title: `${programme.name} | VNTV Originals`,
      description: programme.description || undefined,
      images: posterUrl ? [posterUrl] : undefined,
    },
    
    alternates: {
      canonical: `${siteUrl}/originals/${programme.slug}`,
    },
  };
}

export default async function ProgrammePage({ params }: ProgrammePageProps) {
  const { slug } = await params;
  
  const [programmeResult, episodesResult] = await Promise.all([
    getProgrammeBySlug(slug),
    // We need to get the programme first to get episodes, but we can optimize this
    getProgrammeBySlug(slug).then(async (result) => {
      if (result.data) {
        return await getProgrammeEpisodes(result.data.id);
      }
      return { data: [], error: null };
    }),
  ]);

  if (programmeResult.error || !programmeResult.data) {
    notFound();
  }

  const programme = programmeResult.data;
  const episodes = (episodesResult.data || []).filter((ep) => ep.is_published);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const posterUrl = programme.poster_image
    ? `${supabaseUrl}/storage/v1/object/public/${programme.poster_image.storage_path}`
    : null;

  // Get latest episode
  const latestEpisode = episodes.length > 0 ? episodes[0] : null;

  return (
    <PublicLayout>
      {/* Programme Header */}
      <div className="relative bg-surface-secondary border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 items-start">
            {/* Poster */}
            <div className="flex justify-center lg:justify-start">
              {posterUrl ? (
                <div className="relative w-full max-w-[400px] aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={posterUrl}
                    alt={programme.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="w-full max-w-[400px] aspect-[2/3] rounded-lg bg-surface-tertiary flex items-center justify-center">
                  <span className="text-6xl font-bold text-text-tertiary">
                    {programme.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              {/* Type Badge */}
              {programme.programme_type && (
                <div className="mb-4">
                  <span className="inline-block px-4 py-2 rounded-lg bg-accent-yellow/10 text-accent-yellow text-sm font-bold uppercase tracking-wide">
                    {programme.programme_type.replace(/_/g, " ")}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary mb-4">
                {programme.name}
              </h1>

              {/* Presenter */}
              {programme.presenter && (
                <div className="flex items-center gap-2 text-lg text-text-secondary mb-6">
                  <User className="w-5 h-5" />
                  <span>Presented by <strong>{programme.presenter}</strong></span>
                </div>
              )}

              {/* Description */}
              {programme.description && (
                <p className="text-lg text-text-secondary mb-8 leading-relaxed max-w-3xl">
                  {programme.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div>
                  <p className="text-2xl font-bold text-text-primary">{episodes.length}</p>
                  <p className="text-sm text-text-tertiary">Episodes</p>
                </div>
              </div>

              {/* Latest Episode CTA */}
              {latestEpisode && (
                <div>
                  <Link href={`/originals/${programme.slug}/${latestEpisode.slug}`}>
                    <Button variant="primary" size="lg">
                      <Play className="w-5 h-5 mr-2" />
                      Watch Latest Episode
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <h2 className="text-3xl font-extrabold text-text-primary mb-8">
          Episodes
        </h2>

        {episodes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-text-secondary">
              No episodes available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {episodes.map((episode) => {
              const thumbnailUrl = episode.thumbnail
                ? `${supabaseUrl}/storage/v1/object/public/media/${episode.thumbnail.storage_path}`
                : posterUrl; // Fallback to programme poster

              return (
                <Link
                  key={episode.id}
                  href={`/originals/${programme.slug}/${episode.slug}`}
                  className="group block bg-surface-secondary rounded-lg overflow-hidden hover:ring-2 hover:ring-accent-yellow transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-surface-tertiary">
                    {thumbnailUrl ? (
                      <Image
                        src={thumbnailUrl}
                        alt={episode.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-text-tertiary">
                          EP {episode.episode_number}
                        </span>
                      </div>
                    )}
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                        <Play className="w-8 h-8 text-black ml-1" />
                      </div>
                    </div>

                    {/* Episode Number Badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/80 text-white text-xs font-bold">
                      Episode {episode.episode_number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-yellow transition-colors mb-2 line-clamp-2">
                      {episode.title}
                    </h3>

                    {episode.description && (
                      <p className="text-sm text-text-tertiary line-clamp-2 mb-3">
                        {episode.description}
                      </p>
                    )}

                    {episode.published_at && (
                      <div className="flex items-center gap-2 text-xs text-text-tertiary">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(episode.published_at), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
