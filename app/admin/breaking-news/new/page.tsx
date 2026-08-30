import { PageHeader } from "@/components/cms/page-header";
import BreakingNewsForm from "@/components/cms/breaking-news-form";

export default function NewBreakingNewsPage() {
  return (
    <div>
      <PageHeader
        title="Add Breaking News"
        description="Create a new breaking news ticker item"
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BreakingNewsForm mode="create" />
      </div>
    </div>
  );
}
