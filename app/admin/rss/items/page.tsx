import { Suspense } from "react";
import { getRssItems, getRssFeeds } from "@/app/actions/rss";
import RssItemsClient from "./rss-items-client";

export const metadata = {
  title: "RSS Items Review - VNTV Admin",
  description: "Review and manage imported RSS feed items",
};

export default async function RssItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; feedId?: string }>;
}) {
  // Await searchParams in Next.js 15+
  const params = await searchParams;
  
  // Get filters from search params
  const status = params.status as "pending" | "approved" | "rejected" | "published" | undefined;
  const feedId = params.feedId;

  // Fetch RSS items with filters
  const { data: items, error: itemsError } = await getRssItems({
    status,
    feedId,
    limit: 50,
  });

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          RSS Items Review
        </h1>
        <p className="text-gray-600">
          Review, approve, and convert RSS feed items to articles
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <RssItemsClient
          initialItems={items || []}
          feeds={feeds || []}
          initialStatus={status}
          initialFeedId={feedId}
        />
      </Suspense>
    </div>
  );
}
