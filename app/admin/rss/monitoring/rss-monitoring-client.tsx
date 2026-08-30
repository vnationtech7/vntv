"use client";

import { useState } from "react";
import { RssFeed, RssImportLog, triggerRssIngestion, triggerSingleFeedIngestion } from "@/app/actions/rss";
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Play,
} from "lucide-react";

interface FeedWithStats extends RssFeed {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    published: number;
  };
}

interface RssMonitoringClientProps {
  feeds: FeedWithStats[];
  recentLogs: RssImportLog[];
}

export default function RssMonitoringClient({
  feeds: initialFeeds,
  recentLogs: initialLogs,
}: RssMonitoringClientProps) {
  const [feeds, setFeeds] = useState(initialFeeds);
  const [recentLogs, setRecentLogs] = useState(initialLogs);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestingFeedId, setIngestingFeedId] = useState<string | null>(null);

  const handleTriggerAllFeeds = async () => {
    setIsIngesting(true);
    try {
      const result = await triggerRssIngestion();
      if (result.success) {
        alert("RSS ingestion triggered successfully!");
        // Reload page to see new data
        window.location.reload();
      } else {
        alert(`Failed to trigger ingestion: ${result.error}`);
      }
    } catch (error) {
      console.error("Error triggering ingestion:", error);
      alert("Failed to trigger RSS ingestion");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleTriggerSingleFeed = async (feedId: string) => {
    setIngestingFeedId(feedId);
    try {
      const result = await triggerSingleFeedIngestion(feedId);
      if (result.success) {
        alert("Feed ingestion triggered successfully!");
        // Reload page to see new data
        window.location.reload();
      } else {
        alert(`Failed to trigger ingestion: ${result.error}`);
      }
    } catch (error) {
      console.error("Error triggering feed ingestion:", error);
      alert("Failed to trigger feed ingestion");
    } finally {
      setIngestingFeedId(null);
    }
  };

  const getFeedHealthStatus = (feed: FeedWithStats) => {
    if (!feed.is_enabled) {
      return { status: "disabled", color: "gray", icon: Clock };
    }
    if (feed.last_error) {
      return { status: "error", color: "red", icon: AlertCircle };
    }
    if (!feed.last_success_at) {
      return { status: "never_fetched", color: "yellow", icon: AlertTriangle };
    }
    const hoursSinceLastSuccess = 
      (Date.now() - new Date(feed.last_success_at).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSuccess > 24) {
      return { status: "stale", color: "yellow", icon: AlertTriangle };
    }
    return { status: "healthy", color: "green", icon: CheckCircle };
  };

  const enabledFeeds = feeds.filter((f) => f.is_enabled);
  const healthyFeeds = enabledFeeds.filter((f) => !f.last_error && f.last_success_at);
  const errorFeeds = enabledFeeds.filter((f) => f.last_error);
  const totalItems = feeds.reduce((sum, f) => sum + f.stats.total, 0);
  const pendingItems = feeds.reduce((sum, f) => sum + f.stats.pending, 0);

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Total Feeds</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{feeds.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            {enabledFeeds.length} enabled
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Healthy</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{healthyFeeds.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            Fetched in last 24h
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Errors</span>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{errorFeeds.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            Require attention
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm font-medium">Pending Review</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{pendingItems}</p>
          <p className="text-sm text-gray-500 mt-1">
            of {totalItems} total items
          </p>
        </div>
      </div>

      {/* Trigger Ingestion Button */}
      <div className="mb-6">
        <button
          onClick={handleTriggerAllFeeds}
          disabled={isIngesting}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${isIngesting ? "animate-spin" : ""}`} />
          {isIngesting ? "Fetching Feeds..." : "Trigger All Feeds Now"}
        </button>
      </div>

      {/* Feed Health Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Feed Health Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Feed
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Last Fetched
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feeds.map((feed) => {
                const health = getFeedHealthStatus(feed);
                const StatusIcon = health.icon;

                return (
                  <tr key={feed.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{feed.name}</p>
                        <p className="text-sm text-gray-500">{feed.source_name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-5 h-5 text-${health.color}-500`} />
                        <span className="text-sm capitalize">{health.status.replace(/_/g, " ")}</span>
                      </div>
                      {feed.last_error && (
                        <p className="text-xs text-red-600 mt-1">{feed.last_error}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {feed.last_fetched_at
                          ? new Date(feed.last_fetched_at).toLocaleString()
                          : "Never"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <span className="text-gray-900 font-medium">{feed.stats.total}</span>
                        <span className="text-gray-500"> total</span>
                        {feed.stats.pending > 0 && (
                          <span className="text-yellow-600 ml-2">
                            ({feed.stats.pending} pending)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTriggerSingleFeed(feed.id)}
                        disabled={!feed.is_enabled || ingestingFeedId === feed.id}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Fetch Now"
                      >
                        <Play className={`w-4 h-4 ${ingestingFeedId === feed.id ? "animate-spin" : ""}`} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Import Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Import Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Feed
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Started
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Results
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentLogs.slice(0, 20).map((log) => {
                const feed = feeds.find((f) => f.id === log.feed_id);
                const duration = log.completed_at
                  ? Math.round(
                      (new Date(log.completed_at).getTime() -
                        new Date(log.started_at).getTime()) /
                        1000
                    )
                  : null;

                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">
                        {feed?.name || "Unknown Feed"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.status === "success"
                            ? "bg-green-100 text-green-800"
                            : log.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {new Date(log.started_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {duration ? `${duration}s` : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-600">
                        {log.status === "success" && (
                          <>
                            <span className="text-green-600 font-medium">
                              {log.items_imported}
                            </span>{" "}
                            imported,{" "}
                            <span className="text-gray-500">
                              {log.duplicates_found}
                            </span>{" "}
                            duplicates
                          </>
                        )}
                        {log.status === "failed" && (
                          <span className="text-red-600">
                            {log.errors ? JSON.stringify(log.errors) : "Error"}
                          </span>
                        )}
                        {log.status === "running" && (
                          <span className="text-yellow-600">In progress...</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {recentLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No import logs yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
