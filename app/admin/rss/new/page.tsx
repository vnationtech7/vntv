import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { RssFeedForm } from "@/components/cms/rss-feed-form";
import { getAllCategories } from "@/app/actions/category";

export default async function NewRssFeedPage() {
  const { data: categories } = await getAllCategories();

  return (
    <AdminLayout>
      <PageHeader
        title="Add RSS Feed"
        description="Configure a new RSS feed source for automated content ingestion"
      />

      <div className="p-6 max-w-3xl">
        <RssFeedForm
          mode="create"
          categories={categories || []}
        />
      </div>
    </AdminLayout>
  );
}
