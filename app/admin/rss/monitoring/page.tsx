import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getRssFeeds, getRssImportLogs, getRssFeedStats } from "@/app/actions/rss";
import { triggerRssIngestion } from "@/app/actions/rss";
import RssMonitoringClient from "./rss-monitoring-client";

export const metadata = {
  title: "RSS Monitoring - VNTV Admin",
  description: "Monitor RSS feed health and import statistics",
};

export default async function RssMonitoringPage() {
  // Fetch all feeds and their recent logs
  const { data: feeds } = await getRssFeeds();
  const { data: recentLogs } = await getRssImportLogs(undefined, 100);

  // Get stats for each feed
  const feedsWithStats = await Promise.all(
    (feeds || []).map(async (feed) => {
      const { data: stats } = await getRssFeedStats(feed.id);
      return {
        ...feed,
        stats: stats || { total: 0, pending: 0, approved: 0, rejected: 0, published: 0 },
      };
    })
  );

  return (
    <div className="p-8">
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
              RSS Monitoring Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor feed health, import status, and performance metrics
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
              href="/admin/rss/items"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              RSS Items
            </Link>
          </div>
        </div>
      </div>

      <RssMonitoringClient
        feeds={feedsWithStats}
        recentLogs={recentLogs || []}
      />
    </div>
  );
}
