import { Suspense } from "react";
import { getRssItems, getRssFeeds, getRssItemsCount } from "@/app/actions/rss";
import RssItemsClient from "./rss-items-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "RSS Items Review - VNTV Admin",
  description: "Review and manage imported RSS feed items",
};

export default async function RssItemsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    feedId?: string;
    page?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}) {
  // Await searchParams in Next.js 15+
  const params = await searchParams;
  
  // Get filters and pagination from search params
  const status = params.status as "pending" | "approved" | "rejected" | "published" | undefined;
  const feedId = params.feedId;
  const page = parseInt(params.page || "1");
  const sortBy = params.sortBy || "fetched_at";
  const sortOrder = params.sortOrder || "desc";
  const itemsPerPage = 100; // Increased from 50 to 100
  const offset = (page - 1) * itemsPerPage;

  // Fetch RSS items with filters and pagination
  const { data: items, error: itemsError } = await getRssItems({
    status,
    feedId,
    limit: itemsPerPage,
    offset,
    sortBy,
    sortOrder: sortOrder as "asc" | "desc",
  });

  // Get total count for pagination
  const { count: totalCount } = await getRssItemsCount({
    status,
    feedId,
  });

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Fetch all feeds for filter dropdown
  const { data: feeds } = await getRssFeeds();

  if (itemsError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading RSS items: {itemsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back Button and Header */}
      <div className="mb-8">
        <Link
          href="/admin/rss"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to RSS Feeds
        </Link>
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              RSS Items Review
            </h1>
            <p className="text-gray-600">
              Review, approve, and convert RSS feed items to articles ({totalCount} total items)
            </p>
          </div>
          
          {/* Quick Navigation Links */}
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/admin/rss"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              RSS Feeds
            </Link>
            <Link
              href="/admin/rss/monitoring"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Monitoring
            </Link>
          </div>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <RssItemsClient
          initialItems={items || []}
          feeds={feeds || []}
          initialStatus={status}
          initialFeedId={feedId}
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          sortBy={sortBy}
          sortOrder={sortOrder}
        />
      </Suspense>
    </div>
  );
}
