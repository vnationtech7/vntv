import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { getActiveProgrammes } from "@/app/actions/originals";
import { getProgrammeEpisodes } from "@/app/actions/episode";

export const metadata: Metadata = {
  title: "VNTV Originals | VNTV",
  description: "Watch exclusive VNTV original series and shows",
};

export default async function OriginalsPage() {
  // Fetch all active programmes
  const { data: programmes, error } = await getActiveProgrammes();

  if (error || !programmes || programmes.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            No Originals Available
          </h1>
          <p className="text-text-secondary">
            Check back soon for exclusive VNTV original series
          </p>
        </div>
      </div>
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Fetch episode counts for each programme
  const programmesWithCounts = await Promise.all(
    programmes.map(async (programme) => {
      const { data: episodes } = await getProgrammeEpisodes(programme.id);
      const episodeCount = episodes?.filter((ep) => ep.is_published).length || 0;
      return { ...programme, episodeCount };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
          VNTV Originals
        </h1>
        <p className="text-lg text-text-secondary max-w-3xl">
          Exclusive series and shows produced by VNTV. Watch in-depth
          investigative reports, documentaries, and original content.
        </p>
      </div>

      {/* Programmes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programmesWithCounts.map((programme) => (
          <Link
            key={programme.id}
            href={`/originals/${programme.slug}`}
            className="group block bg-surface-secondary rounded-lg overflow-hidden hover:ring-2 hover:ring-accent-yellow transition-all"
          >
            {/* Poster */}
            <div className="relative w-full aspect-[2/3] overflow-hidden">
              {programme.poster_image ? (
                <Image
                  src={`${supabaseUrl}/storage/v1/object/public/${programme.poster_image.storage_path}`}
                  alt={programme.poster_image.alt_text || programme.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-surface-tertiary flex items-center justify-center">
                  <span className="text-6xl font-bold text-text-tertiary">
                    {programme.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Play Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-accent-yellow flex items-center justify-center">
                  <Play className="w-8 h-8 text-black ml-1" />
                </div>
              </div>

              {/* Episode Count Badge */}
              {programme.episodeCount > 0 && (
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-xs font-bold text-white">
                    {programme.episodeCount} Episode
                    {programme.episodeCount !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            {/* Programme Info */}
            <div className="p-4">
              <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-accent-yellow transition-colors">
                {programme.name}
              </h3>
              {programme.description && (
                <p className="text-sm text-text-secondary line-clamp-2">
                  {programme.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
