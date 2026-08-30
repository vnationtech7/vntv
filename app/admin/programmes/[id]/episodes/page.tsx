import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/cms/admin-layout";
import { getProgramme } from "@/app/actions/programme";
import { getProgrammeEpisodes } from "@/app/actions/episode";
import EpisodesPageClient from "./episodes-client";

interface EpisodesPageProps {
  params: Promise<{ id: string }>;
}

export default async function EpisodesPage({ params }: EpisodesPageProps) {
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

  return (
    <AdminLayout>
      <EpisodesPageClient
        programmeId={id}
        programmeName={programme.name}
        episodes={episodes}
        error={episodesResult.error}
      />
    </AdminLayout>
  );
}
