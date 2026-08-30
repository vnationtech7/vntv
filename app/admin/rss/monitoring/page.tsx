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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          RSS Monitoring Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor feed health, import status, and performance metrics
        </p>
      </div>

      <RssMonitoringClient
        feeds={feedsWithStats}
        recentLogs={recentLogs || []}
      />
    </div>
  );
}
