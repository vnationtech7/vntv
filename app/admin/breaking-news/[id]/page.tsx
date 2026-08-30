import { PageHeader } from "@/components/cms/page-header";
import BreakingNewsForm from "@/components/cms/breaking-news-form";
import { getBreakingNewsById } from "@/app/actions/breaking-news";
import { notFound } from "next/navigation";

export default async function EditBreakingNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: breakingNews } = await getBreakingNewsById(id);

  if (!breakingNews) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title="Edit Breaking News"
        description={`Editing: ${breakingNews.headline}`}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BreakingNewsForm mode="edit" initialData={breakingNews} />
      </div>
    </div>
  );
}
