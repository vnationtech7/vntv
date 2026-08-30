import { PageHeader } from "@/components/cms/page-header";
import { getAllBreakingNews } from "@/app/actions/breaking-news";
import BreakingNewsClient from "./breaking-news-client";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function BreakingNewsPage() {
  const { data: breakingNews } = await getAllBreakingNews();

  return (
    <div>
      <PageHeader
        title="Breaking News"
        description="Manage breaking news ticker items"
      >
        <Link
          href="/admin/breaking-news/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Breaking News
        </Link>
      </PageHeader>

      <BreakingNewsClient initialNews={breakingNews || []} />
    </div>
  );
}
