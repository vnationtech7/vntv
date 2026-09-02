"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createBreakingNews,
  updateBreakingNews,
  BreakingNews,
} from "@/app/actions/breaking-news";
import { createClient } from "@/lib/supabase/client";
import { Search, Link2, X, Calendar, AlertTriangle } from "lucide-react";

interface BreakingNewsFormProps {
  initialData?: BreakingNews;
  mode: "create" | "edit";
}

export default function BreakingNewsForm({
  initialData,
  mode,
}: BreakingNewsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [headline, setHeadline] = useState(initialData?.headline_override || "");
  const [type, setType] = useState<'breaking' | 'announcement'>(
    initialData?.type || 'breaking'
  );
  const [articleId, setArticleId] = useState<string | null>(
    initialData?.article_id || null
  );
  const [linkUrl, setLinkUrl] = useState(initialData?.link_url || "");
  const [priority, setPriority] = useState(initialData?.priority ?? 0);
  const [startTime, setStartTime] = useState(
    initialData?.starts_at
      ? new Date(initialData.starts_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [endTime, setEndTime] = useState(
    initialData?.expires_at
      ? new Date(initialData.expires_at).toISOString().slice(0, 16)
      : ""
  );
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  // Article search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(
    initialData?.article || null
  );

  // Link type selection
  const [linkType, setLinkType] = useState<"article" | "url" | "none">(
    initialData?.article_id ? "article" : initialData?.link_url ? "url" : "none"
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, slug")
        .eq("status", "published")
        .ilike("title", `%${searchQuery}%`)
        .order("published_at", { ascending: false })
        .limit(10);

      if (data) {
        setSearchResults(data);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Error searching articles:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectArticle = (article: any) => {
    setSelectedArticle(article);
    setArticleId(article.id);
    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const clearArticleSelection = () => {
    setSelectedArticle(null);
    setArticleId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!headline.trim()) {
      setError("Headline is required");
      return;
    }

    if (linkType === "article" && !articleId) {
      setError("Please select an article or choose a different link type");
      return;
    }

    if (linkType === "url" && !linkUrl.trim()) {
      setError("Please enter a URL or choose a different link type");
      return;
    }

    setIsSubmitting(true);

    try {
      const newsData = {
        headline_override: headline.trim(),
        type: type,
        article_id: linkType === "article" ? articleId : null,
        link_url: linkType === "url" ? linkUrl.trim() : null,
        priority,
        starts_at: new Date(startTime).toISOString(),
        expires_at: endTime ? new Date(endTime).toISOString() : null,
        is_active: isActive,
      };

      const result =
        mode === "create"
          ? await createBreakingNews(newsData)
          : await updateBreakingNews(initialData!.id, newsData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/breaking-news");
        router.refresh();
      }
    } catch (err) {
      console.error("Error saving breaking news:", err);
      setError("Failed to save breaking news");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Headline */}
      <div>
        <label
          htmlFor="headline"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Headline *
        </label>
        <input
          type="text"
          id="headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Enter breaking news headline..."
          required
        />
        <p className="text-sm text-gray-600 mt-1">
          Keep it concise - will appear in the ticker
        </p>
      </div>

      {/* Type Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Type *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setType('breaking')}
            className={`p-4 border-2 rounded-lg transition-all ${
              type === 'breaking'
                ? "border-red-600 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-center">
              <p className="font-medium text-gray-900">🔥 Breaking News</p>
              <p className="text-xs text-gray-600 mt-1">Urgent news alerts</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setType('announcement')}
            className={`p-4 border-2 rounded-lg transition-all ${
              type === 'announcement'
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-center">
              <p className="font-medium text-gray-900">📢 Announcement</p>
              <p className="text-xs text-gray-600 mt-1">General notices</p>
            </div>
          </button>
        </div>
      </div>

      {/* Link Type Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Link Destination
        </label>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setLinkType("none")}
            className={`p-4 border-2 rounded-lg transition-all ${
              linkType === "none"
                ? "border-red-600 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-center">
              <p className="font-medium text-gray-900">No Link</p>
              <p className="text-xs text-gray-600 mt-1">Text only</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setLinkType("article")}
            className={`p-4 border-2 rounded-lg transition-all ${
              linkType === "article"
                ? "border-red-600 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-center">
              <p className="font-medium text-gray-900">Link to Article</p>
              <p className="text-xs text-gray-600 mt-1">Internal link</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setLinkType("url")}
            className={`p-4 border-2 rounded-lg transition-all ${
              linkType === "url"
                ? "border-red-600 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-center">
              <p className="font-medium text-gray-900">External URL</p>
              <p className="text-xs text-gray-600 mt-1">Custom link</p>
            </div>
          </button>
        </div>
      </div>

      {/* Article Search */}
      {linkType === "article" && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Select Article *
          </label>

          {selectedArticle ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {selectedArticle.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedArticle.slug}
                </p>
              </div>
              <button
                type="button"
                onClick={clearArticleSelection}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Search articles by title..."
                />
              </div>

              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {searchResults.map((article) => (
                    <button
                      key={article.id}
                      type="button"
                      onClick={() => selectArticle(article)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <p className="font-medium text-gray-900">
                        {article.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {article.slug}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {isSearching && (
                <p className="text-sm text-gray-600 mt-2">Searching...</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* External URL */}
      {linkType === "url" && (
        <div>
          <label
            htmlFor="linkUrl"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            External URL *
          </label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="url"
              id="linkUrl"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="https://example.com/news/article"
              required={linkType === "url"}
            />
          </div>
        </div>
      )}

      {/* Priority */}
      <div>
        <label
          htmlFor="priority"
          className="block text-sm font-semibold text-gray-900 mb-2"
        >
          Priority
        </label>
        <input
          type="number"
          id="priority"
          value={priority}
          onChange={(e) => setPriority(parseInt(e.target.value))}
          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          min="0"
          max="999"
        />
        <p className="text-sm text-gray-600 mt-1">
          Higher priority items appear first (0-999)
        </p>
      </div>

      {/* Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            Start Time *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="datetime-local"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-semibold text-gray-900 mb-2"
          >
            End Time (Optional)
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="datetime-local"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Leave empty for no expiration
          </p>
        </div>
      </div>

      {/* Active Status */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <span className="text-sm font-medium text-gray-900">
            Active (visible on public site when scheduled)
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
            ? "Create Breaking News"
            : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
