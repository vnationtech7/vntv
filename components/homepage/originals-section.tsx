import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui";
import { Play, ArrowRight } from "lucide-react";
import { getActiveProgrammes } from "@/app/actions/originals";
import { getProgrammeEpisodes } from "@/app/actions/episode";

export async function OriginalsSection() {
  // Fetch active programmes for public homepage
  const { data: programmes, error } = await getActiveProgrammes();
  
  // Handle error or empty state gracefully
  if (error || !programmes || programmes.length === 0) {
    // Don't render section if no programmes available
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Get featured programme (first one) and its latest episode
  const featuredProgramme = programmes[0];
  let latestEpisode = null;

  if (featuredProgramme) {
    const { data: episodes } = await getProgrammeEpisodes(featuredProgramme.id);
    const publishedEpisodes = episodes?.filter((ep) => ep.published_at !== null && ep.published_at !== undefined) || [];
    latestEpisode = publishedEpisodes.length > 0 ? publishedEpisodes[0] : null;
  }

  // Get other programmes to display (up to 3)
  const displayProgrammes = programmes.slice(1, 4);

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="w-1 h-6 bg-vntv-red rounded-sm" />
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            VNTV ORIGINALS
          </h2>
        </div>
        <Link href="/originals">
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>

      {/* Featured Programme */}
      {featuredProgramme && (
        <div className="mb-6">
          <Link
            href={`/originals/${featuredProgramme.slug}`}
            className="block group relative bg-surface-secondary rounded-lg overflow-hidden hover:ring-2 hover:ring-accent-yellow transition-all"
          >
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 p-4 md:p-6">
              {/* Poster */}
              <div className="relative w-full h-[400px] md:h-[280px] rounded-lg overflow-hidden flex-shrink-0">
                {featuredProgramme.poster_image ? (
                  <Image
                    src={`${supabaseUrl}/storage/v1/object/public/${featuredProgramme.poster_image.storage_path}`}
                    alt={featuredProgramme.poster_image.alt_text || featuredProgramme.name}
                    fill
                    sizes="300px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-surface-tertiary flex items-center justify-center">
                    <span className="text-6xl font-bold text-text-tertiary">
                      {featuredProgramme.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-accent-yellow flex items-center justify-center">
                    <Play className="w-8 h-8 text-black ml-1" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center">
                <span className="inline-block px-2.5 py-1 rounded bg-accent-yellow text-black text-xs font-bold uppercase tracking-wide mb-2 w-fit">
                  Featured
                </span>
                
                {featuredProgramme.programme_type && (
                  <p className="text-xs text-text-tertiary uppercase tracking-wide mb-2">
                    {featuredProgramme.programme_type.replace(/_/g, " ")}
                  </p>
                )}

                <h3 className="text-2xl md:text-3xl font-extrabold text-text-primary mb-2 group-hover:text-accent-yellow transition-colors">
                  {featuredProgramme.name}
                </h3>

                {featuredProgramme.presenter && (
                  <p className="text-sm text-text-secondary mb-3">
                    Presented by <strong>{featuredProgramme.presenter}</strong>
                  </p>
                )}

                {featuredProgramme.description && (
                  <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                    {featuredProgramme.description}
                  </p>
                )}

                {latestEpisode && (
                  <div className="mb-4">
                    <p className="text-xs text-text-tertiary">Latest Episode</p>
                    <p className="text-sm text-text-primary font-semibold line-clamp-1">
                      {latestEpisode.title}
                    </p>
                  </div>
                )}

                <Button variant="primary" size="md" className="w-fit">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Now
                </Button>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Programme Grid */}
      {displayProgrammes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {displayProgrammes.map((programme) => {
            const posterUrl = programme.poster_image
              ? `${supabaseUrl}/storage/v1/object/public/${programme.poster_image.storage_path}`
              : null;

            return (
              <Link
                key={programme.id}
                href={`/originals/${programme.slug}`}
                className="group block bg-surface-secondary rounded-lg overflow-hidden hover:ring-2 hover:ring-accent-yellow transition-all"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3]">
                  {posterUrl ? (
                    <Image
                      src={posterUrl}
                      alt={programme.poster_image?.alt_text || programme.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-tertiary flex items-center justify-center">
                      <span className="text-4xl font-bold text-text-tertiary">
                        {programme.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="w-8 h-8 text-black ml-1" />
                    </div>
                  </div>

                  {/* Programme Type Badge */}
                  {programme.programme_type && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/80 text-white text-xs font-bold uppercase">
                      {programme.programme_type.replace(/_/g, " ")}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-yellow transition-colors mb-2 line-clamp-2">
                    {programme.name}
                  </h3>

                  {programme.presenter && (
                    <p className="text-sm text-text-tertiary line-clamp-1">
                      {programme.presenter}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
