"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { getActiveBreakingNews, type BreakingNews } from "@/app/actions/breaking-news";

export function BreakingNewsTicker() {
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotation interval (8 seconds)
  const ROTATION_INTERVAL = 8000;
  const TRANSITION_DURATION = 300;

  useEffect(() => {
    loadBreakingNews();
  }, []);

  useEffect(() => {
    if (breakingNews.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      handleNext();
    }, ROTATION_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, breakingNews.length, isPaused]);

  const loadBreakingNews = async () => {
    setLoading(true);
    const { data } = await getActiveBreakingNews();
    if (data) {
      setBreakingNews(data);
    }
    setLoading(false);
  };

  const handleNext = () => {
    if (isTransitioning || breakingNews.length <= 1) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % breakingNews.length);

    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  };

  const handlePrevious = () => {
    if (isTransitioning || breakingNews.length <= 1) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length);

    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
  };

  const handleDotClick = (index: number) => {
    if (isTransitioning || index === currentIndex) return;

    setIsTransitioning(true);
    setCurrentIndex(index);

    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_DURATION);
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
  
  // Determine link href
  const getLink = () => {
    if (currentNews.article_id && currentNews.article) {
      return `/news/${currentNews.article.slug}`;
    }
    if (currentNews.link_url) {
      return currentNews.link_url;
    }
    return null;
  };

  const link = getLink();
  const isExternalLink = link?.startsWith("http");

  return (
    <div className="border-b border-border bg-vntv-red/5">
      <div className="container mx-auto px-4">
        <div 
          className="flex items-center gap-4 py-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Breaking Badge */}
          <div className="flex items-center gap-1.5 rounded bg-vntv-red px-3 py-1 text-xs font-bold uppercase text-white">
            <Flame className="h-3.5 w-3.5 animate-pulse" />
            <span>Breaking</span>
          </div>

          {/* News Content */}
          <div 
            className={`flex-1 overflow-hidden transition-opacity duration-${TRANSITION_DURATION} ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            {link ? (
              isExternalLink ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                  <span className="truncate text-sm font-medium text-text-primary group-hover:text-vntv-red transition-colors">
                    {currentNews.headline_override}
                  </span>
                  <span className="flex-shrink-0 text-xs text-text-tertiary">
                    {getTimeAgo(currentNews.starts_at)}
                  </span>
                </a>
              ) : (
                <Link
                  href={link}
                  className="group flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                  <span className="truncate text-sm font-medium text-text-primary group-hover:text-vntv-red transition-colors">
                    {currentNews.headline_override}
                  </span>
                  <span className="flex-shrink-0 text-xs text-text-tertiary">
                    {getTimeAgo(currentNews.starts_at)}
                  </span>
                </Link>
              )
            ) : (
              <div className="flex items-center gap-3">
                <span className="truncate text-sm font-medium text-text-primary">
                  {currentNews.headline_override}
                </span>
                <span className="flex-shrink-0 text-xs text-text-tertiary">
                  {getTimeAgo(currentNews.starts_at)}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Arrows (only show if multiple items) */}
          {breakingNews.length > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevious}
                disabled={isTransitioning}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-background-panel hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous breaking news"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={isTransitioning}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-background-panel hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
                  onClick={() => handleDotClick(index)}
                  disabled={isTransitioning}
                  className={`h-1.5 rounded-full transition-all disabled:cursor-not-allowed ${
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
