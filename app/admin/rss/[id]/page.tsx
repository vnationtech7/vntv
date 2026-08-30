import { notFound } from "next/navigation";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { RssFeedForm } from "@/components/cms/rss-feed-form";
import { getRssFeed } from "@/app/actions/rss";
import { getAllCategories } from "@/app/actions/category";

interface EditRssFeedPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRssFeedPage({ params }: EditRssFeedPageProps) {
  const { id } = await params;
  
  const [feedResult, categoriesResult] = await Promise.all([
    getRssFeed(id),
    getAllCategories(),
  ]);

  if (feedResult.error || !feedResult.data) {
    notFound();
  }

  const feed = feedResult.data;
  const categories = categoriesResult.data || [];

  return (
    <AdminLayout>
      <PageHeader
        title={`Edit RSS Feed: ${feed.name}`}
        description="Update RSS feed configuration"
      />

      <div className="p-6 max-w-3xl">
        <RssFeedForm
          feed={feed}
          mode="edit"
          categories={categories}
        />
      </div>
    </AdminLayout>
  );
}
