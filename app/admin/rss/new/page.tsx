import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { RssFeedForm } from "@/components/cms/rss-feed-form";
import { getAllCategories } from "@/app/actions/category";

export default async function NewRssFeedPage() {
  const { data: categories } = await getAllCategories();

  return (
    <AdminLayout>
      <div className="mb-4">
        <Link
          href="/admin/rss"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to RSS Feeds
        </Link>
      </div>
      
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
