import { PageHeader } from "@/components/cms/page-header";
import { getAllHomepageSections } from "@/app/actions/homepage";
import { requireEditor } from "@/lib/auth/server-authorization";
import HomepageSectionsClient from "./homepage-sections-client";
import Link from "next/link";
import { Plus, Eye } from "lucide-react";

export default async function HomepageManagementPage() {
  // Require editor role
  await requireEditor();
  
  const { data: sections } = await getAllHomepageSections();

  return (
    <div>
      <PageHeader
        title="Homepage Management"
        description="Manage homepage sections, featured content, and layout"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Link>
          <Link
            href="/admin/homepage/sections/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </Link>
        </div>
      </PageHeader>

      <HomepageSectionsClient initialSections={sections || []} />
    </div>
  );
}
