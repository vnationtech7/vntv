import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { EpisodeForm } from "@/components/cms/episode-form";
import { getEpisode } from "@/app/actions/episode";

interface EditEpisodePageProps {
  params: Promise<{ id: string; episodeId: string }>;
}

export default async function EditEpisodePage({ params }: EditEpisodePageProps) {
  const { id, episodeId } = await params;
  const { data: episode, error } = await getEpisode(episodeId);

  if (error || !episode) {
    notFound();
  }

  return (
    <AdminLayout>
      <PageHeader
        title={`Edit: Episode ${episode.episode_number}`}
        description={episode.title}
      />

      <div className="p-6 max-w-3xl">
        <EpisodeForm programmeId={id} episode={episode} mode="edit" />
      </div>
    </AdminLayout>
  );
}
