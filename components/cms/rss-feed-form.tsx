"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { createRssFeed, updateRssFeed, type RssFeed } from "@/app/actions/rss";
import { Loader2, CheckCircle, XCircle, Radio } from "lucide-react";

interface RssFeedFormProps {
  feed?: RssFeed;
  mode: "create" | "edit";
  categories: Array<{ id: string; name: string }>;
}

const COUNTRIES = [
  "Ghana",
  "Nigeria",
  "South Africa",
  "Kenya",
  "Ethiopia",
  "Egypt",
  "Morocco",
  "Tanzania",
  "Uganda",
  "Algeria",
  "Other",
];

interface TestResult {
  success: boolean;
  message: string;
  itemsFound?: number;
  feedTitle?: string;
  error?: string;
}

export function RssFeedForm({ feed, mode, categories }: RssFeedFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: feed?.name || "",
    url: feed?.url || "",
    source_name: feed?.source_name || "",
    country: feed?.country || "",
    category_id: feed?.category_id || "",
    is_enabled: feed?.is_enabled ?? true,
    auto_publish: feed?.auto_publish ?? false,
    requires_review: feed?.requires_review ?? true,
    fetch_interval: feed?.fetch_interval || 14400, // 4 hours default
  });

  const handleTestFetch = async () => {
    if (!formData.url) {
      setTestResult({
        success: false,
        message: "Please enter a feed URL first",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/rss/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: formData.url }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTestResult({
          success: true,
          message: "Feed is valid and accessible!",
          itemsFound: result.itemsFound,
          feedTitle: result.feedTitle,
        });
      } else {
        setTestResult({
          success: false,
          message: result.error || "Failed to fetch feed",
          error: result.error,
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: "Network error. Please check the URL and try again.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (mode === "create") {
        result = await createRssFeed({
          ...formData,
          category_id: formData.category_id || undefined,
          country: formData.country || undefined,
        });
      } else {
        result = await updateRssFeed(feed!.id, {
          ...formData,
          category_id: formData.category_id || undefined,
          country: formData.country || undefined,
        });
      }

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      router.push("/admin/rss");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Feed Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Feed Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
          placeholder="e.g., GhanaWeb News"
        />
      </div>

      {/* Feed URL */}
      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-text-primary mb-2"
        >
          RSS Feed URL *
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            id="url"
            value={formData.url}
            onChange={(e) => {
              setFormData({ ...formData, url: e.target.value });
              setTestResult(null); // Clear test result when URL changes
            }}
            required
            className="flex-1 px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
            placeholder="https://example.com/rss"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleTestFetch}
            disabled={isTesting || !formData.url}
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 mr-2" />
                Test Feed
              </>
            )}
          </Button>
        </div>
        
        {/* Test Result */}
        {testResult && (
          <div
            className={`mt-2 p-3 rounded-lg border ${
              testResult.success
                ? "bg-green-500/10 border-green-500 text-green-700"
                : "bg-red-500/10 border-red-500 text-red-700"
            }`}
          >
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">{testResult.message}</p>
                {testResult.success && (
                  <div className="text-sm mt-1 space-y-1">
                    {testResult.feedTitle && (
                      <p>Feed Title: <strong>{testResult.feedTitle}</strong></p>
                    )}
                    {testResult.itemsFound !== undefined && (
                      <p>Items Found: <strong>{testResult.itemsFound}</strong></p>
                    )}
                  </div>
                )}
                {testResult.error && (
                  <p className="text-sm mt-1">{testResult.error}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <p className="text-xs text-text-tertiary mt-1">
          Must be a valid RSS or Atom feed URL
        </p>
      </div>

      {/* Source Name */}
      <div>
        <label
          htmlFor="source_name"
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Source Name *
        </label>
        <input
          type="text"
          id="source_name"
          value={formData.source_name}
          onChange={(e) =>
            setFormData({ ...formData, source_name: e.target.value })
          }
          required
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
          placeholder="e.g., GhanaWeb"
        />
        <p className="text-xs text-text-tertiary mt-1">
          Will be displayed as the article source
        </p>
      </div>

      {/* Country */}
      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Country (Optional)
        </label>
        <select
          id="country"
          value={formData.country}
          onChange={(e) =>
            setFormData({ ...formData, country: e.target.value })
          }
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
        >
          <option value="">Select country...</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="category_id"
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Default Category (Optional)
        </label>
        <select
          id="category_id"
          value={formData.category_id}
          onChange={(e) =>
            setFormData({ ...formData, category_id: e.target.value })
          }
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
        >
          <option value="">Select category...</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-text-tertiary mt-1">
          Articles imported from this feed will default to this category
        </p>
      </div>

      {/* Fetch Interval */}
      <div>
        <label
          htmlFor="fetch_interval"
          className="block text-sm font-medium text-text-primary mb-2"
        >
          Fetch Interval (hours)
        </label>
        <input
          type="number"
          id="fetch_interval"
          value={formData.fetch_interval / 3600}
          onChange={(e) =>
            setFormData({
              ...formData,
              fetch_interval: parseInt(e.target.value) * 3600,
            })
          }
          min={1}
          max={24}
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
        />
        <p className="text-xs text-text-tertiary mt-1">
          How often to check for new content (Supabase cron runs every 4 hours by default)
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_enabled"
            checked={formData.is_enabled}
            onChange={(e) =>
              setFormData({ ...formData, is_enabled: e.target.checked })
            }
            className="w-4 h-4 rounded border-border text-accent-yellow focus:ring-accent-yellow"
          />
          <label htmlFor="is_enabled" className="text-sm text-text-primary">
            <span className="font-medium">Enabled</span> - Actively fetch content from this feed
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="requires_review"
            checked={formData.requires_review}
            onChange={(e) =>
              setFormData({ ...formData, requires_review: e.target.checked })
            }
            className="w-4 h-4 rounded border-border text-accent-yellow focus:ring-accent-yellow"
          />
          <label htmlFor="requires_review" className="text-sm text-text-primary">
            <span className="font-medium">Requires Review</span> - Imported items need approval before publishing
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="auto_publish"
            checked={formData.auto_publish}
            onChange={(e) =>
              setFormData({ ...formData, auto_publish: e.target.checked })
            }
            disabled={formData.requires_review}
            className="w-4 h-4 rounded border-border text-accent-yellow focus:ring-accent-yellow disabled:opacity-50"
          />
          <label
            htmlFor="auto_publish"
            className="text-sm text-text-primary"
          >
            <span className="font-medium">Auto-publish</span> - Automatically publish approved items
            {formData.requires_review && (
              <span className="text-text-tertiary"> (disabled when review is required)</span>
            )}
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === "create" ? "Creating..." : "Saving..."}
            </>
          ) : mode === "create" ? (
            "Create Feed"
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
