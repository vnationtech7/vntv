"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { getActiveBreakingNews, type BreakingNews } from "@/app/actions/breaking-news";

export function BreakingNewsTicker() {
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBreakingNews();
  }, []);

  useEffect(() => {
    if (breakingNews.length <= 1) return;

    // Auto-rotate every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [breakingNews.length]);

  const loadBreakingNews = async () => {
    setLoading(true);
    const { data } = await getActiveBreakingNews();
    if (data) {
      setBreakingNews(data);
    }
    setLoading(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Don't show ticker if no breaking news
  if (!loading && breakingNews.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="border-b border-border bg-vntv-red/5">
        <div className="container mx-auto px-4">
          <div className="flex h-12 items-center gap-4">
            <div className="flex h-6 w-20 animate-pulse items-center gap-1 rounded bg-vntv-red/20" />
            <div className="h-4 flex-1 animate-pulse rounded bg-background-panel" />
          </div>
        </div>
      </div>
    );
  }

  const currentNews = breakingNews[currentIndex];
  const headline = currentNews.headline_override || currentNews.article?.title || "Breaking News";
  const slug = currentNews.article?.slug;
  const publishedAt = currentNews.article?.published_at || currentNews.created_at;

  return (
    <div className="border-b border-border bg-vntv-red/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-2">
          {/* Breaking Badge */}
          <div className="flex items-center gap-1.5 rounded bg-vntv-red px-3 py-1 text-xs font-bold uppercase text-white">
            <Flame className="h-3.5 w-3.5" />
            <span>Breaking</span>
          </div>

          {/* News Content */}
          <div className="flex-1 overflow-hidden">
            {slug ? (
              <Link
                href={`/news/${slug}`}
                className="group flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <span className="truncate text-sm font-medium text-text-primary group-hover:text-vntv-red transition-colors">
                  {headline}
                </span>
                <span className="flex-shrink-0 text-xs text-text-tertiary">
                  {getTimeAgo(publishedAt)}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <span className="truncate text-sm font-medium text-text-primary">
                  {headline}
                </span>
                <span className="flex-shrink-0 text-xs text-text-tertiary">
                  {getTimeAgo(publishedAt)}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Arrows (only show if multiple items) */}
          {breakingNews.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevious}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-background-panel hover:text-text-primary"
                aria-label="Previous breaking news"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-background-panel hover:text-text-primary"
                aria-label="Next breaking news"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Counter (only show if multiple items) */}
          {breakingNews.length > 1 && (
            <div className="hidden sm:flex items-center gap-1">
              {breakingNews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-6 bg-vntv-red"
                      : "w-1.5 bg-border hover:bg-text-tertiary"
                  }`}
                  aria-label={`Go to breaking news ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
