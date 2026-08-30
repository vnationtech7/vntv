import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { EpisodeForm } from "@/components/cms/episode-form";
import { getProgramme } from "@/app/actions/programme";
import { getProgrammeEpisodes } from "@/app/actions/episode";

interface NewEpisodePageProps {
  params: Promise<{ id: string }>;
}

export default async function NewEpisodePage({ params }: NewEpisodePageProps) {
  const { id } = await params;
  
  const [programmeResult, episodesResult] = await Promise.all([
    getProgramme(id),
    getProgrammeEpisodes(id),
  ]);

  if (programmeResult.error || !programmeResult.data) {
    notFound();
  }

  const programme = programmeResult.data;
  const episodes = episodesResult.data || [];
  
  // Calculate next episode number
  const nextEpisodeNumber = episodes.length > 0 
    ? Math.max(...episodes.map(ep => ep.episode_number)) + 1 
    : 1;

  return (
    <AdminLayout>
      <PageHeader
        title={`New Episode: ${programme.name}`}
        description="Add a new episode to this programme"
      />

      <div className="p-6 max-w-3xl">
        <EpisodeForm 
          programmeId={id} 
          mode="create"
          suggestedEpisodeNumber={nextEpisodeNumber}
        />
      </div>
    </AdminLayout>
  );
}
