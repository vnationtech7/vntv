import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui";
import { getRssFeeds } from "@/app/actions/rss";
import { requireEditor } from "@/lib/auth/server-authorization";
import { Plus, Rss, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import RssFeedsClient from "./rss-feeds-client";

export default async function RssFeedsPage() {
  // Require editor role
  await requireEditor();
  
  const { data: feeds, error } = await getRssFeeds();

  return (
    <AdminLayout>
      <PageHeader
        title="RSS Feeds"
        description="Manage RSS feed sources for automated content ingestion"
      >
        <Link href="/admin/rss/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add RSS Feed
          </Button>
        </Link>
      </PageHeader>

      <div className="p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            Error loading RSS feeds: {error}
          </div>
        )}

        {feeds && feeds.length === 0 ? (
          <div className="text-center py-20">
            <Rss className="w-16 h-16 mx-auto mb-4 text-text-tertiary" />
            <p className="text-text-secondary mb-4">
              No RSS feeds configured yet
            </p>
            <p className="text-sm text-text-tertiary mb-6">
              Add RSS feeds to automatically import news content from external sources
            </p>
            <Link href="/admin/rss/new">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Add First RSS Feed
              </Button>
            </Link>
          </div>
        ) : (
          <RssFeedsClient feeds={feeds || []} />
        )}
      </div>
    </AdminLayout>
  );
}
