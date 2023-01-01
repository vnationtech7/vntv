import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
