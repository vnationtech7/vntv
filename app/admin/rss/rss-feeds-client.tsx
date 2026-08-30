"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { RssFeed, deleteRssFeed, updateRssFeed } from "@/app/actions/rss";
import { Edit, Trash2, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface RssFeedsClientProps {
  feeds: RssFeed[];
}

export default function RssFeedsClient({ feeds }: RssFeedsClientProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [testingFeedId, setTestingFeedId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete RSS feed "${name}"? This will also delete all imported items.`)) {
      return;
    }

    setDeletingId(id);
    const result = await deleteRssFeed(id);
    
    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      router.refresh();
    }
    setDeletingId(null);
  };

  const handleToggleEnabled = async (feed: RssFeed) => {
    setTogglingId(feed.id);
    const result = await updateRssFeed(feed.id, {
      is_enabled: !feed.is_enabled,
    });
    
    if (result.error) {
      alert(`Error: ${result.error}`);
    } else {
      router.refresh();
    }
    setTogglingId(null);
  };

  const handleTestFetch = async (feedId: string) => {
    const feed = feeds.find((f) => f.id === feedId);
    if (!feed) return;

    setTestingFeedId(feedId);
    
    try {
      const response = await fetch("/api/rss/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: feed.url }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(
          `✅ Feed Test Successful!\n\n` +
          `Feed: ${result.feedTitle || feed.name}\n` +
          `Items Found: ${result.itemsFound}\n` +
          `Status: Valid and accessible`
        );
      } else {
        alert(
          `❌ Feed Test Failed\n\n` +
          `Error: ${result.error || "Unknown error"}\n` +
          `Feed URL: ${feed.url}`
        );
      }
    } catch (error) {
      console.error("Test fetch error:", error);
      alert(
        `❌ Network Error\n\n` +
        `Failed to test feed. Please check the URL and try again.`
      );
    } finally {
      setTestingFeedId(null);
    }
  };

  return (
    <div className="space-y-4">
      {feeds.map((feed) => {
        const isDeleting = deletingId === feed.id;
        const isToggling = togglingId === feed.id;

        return (
          <div
            key={feed.id}
            className="bg-surface-secondary rounded-lg border border-border p-4"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Feed Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-text-primary">
                    {feed.name}
                  </h3>
                  
                  {/* Status Badge */}
                  {feed.is_enabled ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-500/10 text-gray-500 text-xs font-medium">
                      <XCircle className="w-3 h-3" />
                      Disabled
                    </span>
                  )}

                  {/* Auto-publish badge */}
                  {feed.auto_publish && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent-yellow/10 text-accent-yellow text-xs font-medium">
                      Auto-publish
                    </span>
                  )}
                </div>

                {/* Source Info */}
                <div className="space-y-1 mb-3">
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium">Source:</span> {feed.source_name}
                    {feed.country && ` • ${feed.country}`}
                    {feed.category && ` • ${feed.category.name}`}
                  </p>
                  <p className="text-sm text-text-tertiary truncate">
                    <span className="font-medium">URL:</span>{" "}
                    <a
                      href={feed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent-yellow transition-colors"
                    >
                      {feed.url}
                    </a>
                  </p>
                  <p className="text-xs text-text-tertiary">
                    <span className="font-medium">Fetch Interval:</span>{" "}
                    {feed.fetch_interval / 3600} hours •{" "}
                    <span className="font-medium">Review:</span>{" "}
                    {feed.requires_review ? "Required" : "Not required"}
                  </p>
                </div>

                {/* Last Fetch Status */}
                <div className="flex items-center gap-4 text-xs">
                  {feed.last_success_at ? (
                    <div className="flex items-center gap-1 text-green-500">
                      <CheckCircle className="w-3 h-3" />
                      Last success:{" "}
                      {formatDistanceToNow(new Date(feed.last_success_at), {
                        addSuffix: true,
                      })}
                    </div>
                  ) : feed.last_fetched_at ? (
                    <div className="flex items-center gap-1 text-text-tertiary">
                      <Clock className="w-3 h-3" />
                      Last fetched:{" "}
                      {formatDistanceToNow(new Date(feed.last_fetched_at), {
                        addSuffix: true,
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-text-tertiary">
                      <Clock className="w-3 h-3" />
                      Never fetched
                    </div>
                  )}

                  {feed.last_error && (
                    <div className="flex items-center gap-1 text-red-500">
                      <AlertCircle className="w-3 h-3" />
                      Error: {feed.last_error.substring(0, 50)}
                      {feed.last_error.length > 50 && "..."}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleEnabled(feed)}
                    disabled={isToggling}
                  >
                    {isToggling ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : feed.is_enabled ? (
                      "Disable"
                    ) : (
                      "Enable"
                    )}
                  </Button>

                  <Link href={`/admin/rss/${feed.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(feed.id, feed.name)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleTestFetch(feed.id)}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test Fetch
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
