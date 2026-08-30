"use client";

import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/cms";
import { Eye, Star, Flame, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  getFeaturedArticlesAdmin,
  toggleArticleFeatured,
  getBreakingNewsAdmin,
  toggleBreakingNewsActive,
} from "./actions";

interface FeaturedArticle {
  id: string;
  title: string;
  slug: string;
  is_featured: boolean;
  published_at: string;
  category: { name: string } | null;
  author: { name: string } | null;
}

interface BreakingNewsItem {
  id: string;
  title: string;
  article_id: string;
  is_active: boolean;
  priority: number;
  starts_at: string;
  expires_at: string | null;
}

export default function HomepageManagementPage() {
  const [featuredArticles, setFeaturedArticles] = useState<FeaturedArticle[]>([]);
  const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [featuredResult, breakingResult] = await Promise.all([
        getFeaturedArticlesAdmin(),
        getBreakingNewsAdmin(),
      ]);

      if (featuredResult.data) {
        setFeaturedArticles(featuredResult.data as FeaturedArticle[]);
      }

      if (breakingResult.data) {
        setBreakingNews(breakingResult.data as BreakingNewsItem[]);
      }
    } catch (error) {
      console.error("Failed to load homepage data:", error);
    }
    setLoading(false);
  };

  const toggleFeatured = async (articleId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleArticleFeatured(articleId, !currentStatus);
      if (result.success) {
        await loadData();
      } else {
        console.error("Failed to toggle featured:", result.error);
      }
    });
  };

  const toggleBreaking = async (breakingId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleBreakingNewsActive(breakingId, !currentStatus);
      if (result.success) {
        await loadData();
      } else {
        console.error("Failed to toggle breaking news:", result.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Homepage Management"
        description="Manage featured articles, breaking news, and homepage sections"
      >
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-vntv-red text-white rounded-md hover:bg-vntv-red/90 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview Homepage
        </Link>
      </PageHeader>

      {loading ? (
        <div className="text-center py-12 text-text-tertiary">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured Articles Section */}
          <div className="bg-surface-secondary border border-border-primary rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-5 h-5 text-vntv-red" />
              <h2 className="text-lg font-bold">Featured Articles</h2>
              <span className="ml-auto text-sm text-text-tertiary">
                {featuredArticles.filter((a) => a.is_featured).length} active
              </span>
            </div>

            <div className="space-y-3">
              {featuredArticles.length === 0 ? (
                <p className="text-sm text-text-tertiary text-center py-8">
                  No featured articles. Mark articles as featured from the articles list.
                </p>
              ) : (
                featuredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-start gap-3 p-3 bg-surface-primary border border-border-primary rounded-md"
                  >
                    <button
                      onClick={() => toggleFeatured(article.id, article.is_featured)}
                      className={`flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
                        article.is_featured
                          ? "bg-vntv-red text-white"
                          : "bg-surface-secondary text-text-tertiary hover:bg-surface-tertiary"
                      }`}
                    >
                      <Star className="w-5 h-5" fill={article.is_featured ? "currentColor" : "none"} />
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 truncate">{article.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-text-tertiary">
                        {article.category && <span>{article.category.name}</span>}
                        {article.category && article.author && <span>•</span>}
                        {article.author && <span>{article.author.name}</span>}
                      </div>
                    </div>

                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="text-xs text-vntv-red hover:underline flex-shrink-0"
                    >
                      Edit
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Breaking News Section */}
          <div className="bg-surface-secondary border border-border-primary rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-5 h-5 text-vntv-red" />
              <h2 className="text-lg font-bold">Breaking News</h2>
              <span className="ml-auto text-sm text-text-tertiary">
                {breakingNews.filter((b) => b.is_active).length} active
              </span>
            </div>

            <div className="space-y-3">
              {breakingNews.length === 0 ? (
                <p className="text-sm text-text-tertiary text-center py-8">
                  No breaking news items. Create one from the breaking news section.
                </p>
              ) : (
                breakingNews.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 bg-surface-primary border border-border-primary rounded-md"
                  >
                    <button
                      onClick={() => toggleBreaking(item.id, item.is_active)}
                      className={`flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center transition-colors ${
                        item.is_active
                          ? "bg-vntv-red text-white"
                          : "bg-surface-secondary text-text-tertiary hover:bg-surface-tertiary"
                      }`}
                    >
                      <Flame className="w-5 h-5" fill={item.is_active ? "currentColor" : "none"} />
                    </button>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1 truncate">{item.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-text-tertiary">
                        <span>Priority: {item.priority}</span>
                        <span>•</span>
                        <span>
                          Expires: {item.expires_at ? new Date(item.expires_at).toLocaleDateString() : "Never"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/admin/breaking-news"
              className="mt-4 block text-center text-sm text-vntv-red hover:underline"
            >
              Manage Breaking News →
            </Link>
          </div>

          {/* Homepage Sections Stats */}
          <div className="bg-surface-secondary border border-border-primary rounded-lg p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-vntv-red" />
              <h2 className="text-lg font-bold">Homepage Sections Status</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-surface-primary rounded-lg">
                <div className="text-2xl font-bold text-vntv-red mb-1">
                  {featuredArticles.filter((a) => a.is_featured).length}
                </div>
                <div className="text-sm text-text-tertiary">Hero Articles</div>
              </div>

              <div className="text-center p-4 bg-surface-primary rounded-lg">
                <div className="text-2xl font-bold text-vntv-red mb-1">
                  {breakingNews.filter((b) => b.is_active).length}
                </div>
                <div className="text-sm text-text-tertiary">Breaking News</div>
              </div>

              <div className="text-center p-4 bg-surface-primary rounded-lg">
                <div className="text-2xl font-bold text-vntv-red mb-1">8</div>
                <div className="text-sm text-text-tertiary">Latest Articles</div>
              </div>

              <div className="text-center p-4 bg-surface-primary rounded-lg">
                <div className="text-2xl font-bold text-vntv-red mb-1">4</div>
                <div className="text-sm text-text-tertiary">Latest Videos</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
