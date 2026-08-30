import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PublicLayout } from "@/components/layout";
import RssItemViewer from "./rss-item-viewer";

interface RssItemPageProps {
  params: Promise<{ id: string }>;
}

async function getRssItem(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("rss_items")
    .select(`
      *,
      feed:rss_feeds(id, name, source_name, category_id)
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function RssItemPage({ params }: RssItemPageProps) {
  const { id } = await params;
  const item = await getRssItem(id);

  if (!item) {
    notFound();
  }

  return (
    <PublicLayout>
      <RssItemViewer item={item} />
    </PublicLayout>
  );
}
