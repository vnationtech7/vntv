"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Megaphone } from "lucide-react";
import { getActiveBreakingNews, type BreakingNews } from "@/app/actions/breaking-news";

export function BreakingNewsTicker() {
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    loadBreakingNews();
  }, []);

  const loadBreakingNews = async () => {
    setLoading(true);
    const { data } = await getActiveBreakingNews();
    if (data) {
      setBreakingNews(data);
    }
    setLoading(false);
  };

  // Don't show ticker if no breaking news
  if (!loading && breakingNews.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="border-b border-border bg-background-panel">
        <div className="container mx-auto px-4">
          <div className="flex h-12 items-center gap-4">
            <div className="h-6 w-20 animate-pulse rounded bg-background-secondary" />
            <div className="h-4 flex-1 animate-pulse rounded bg-background-secondary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-background-panel overflow-hidden">
      <div 
        className="relative h-12"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Marquee Container */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 flex items-center gap-3 overflow-hidden">
            {/* Static Label */}
            <div className="flex-shrink-0 flex items-center gap-1.5 rounded bg-vntv-red px-3 py-1 text-xs font-bold uppercase text-white">
              <Flame className="h-3.5 w-3.5" />
              <span>Live</span>
            </div>

            {/* Scrolling Content */}
            <div className="flex-1 overflow-hidden relative">
              <div className={`flex gap-8 ${isPaused ? '' : 'animate-scroll'}`}>
                {/* First Set of Items */}
                {breakingNews.map((news, index) => (
                  <NewsItem key={`news-${index}`} news={news} />
                ))}
                
                {/* Duplicate for Seamless Loop (only if we have items) */}
                {breakingNews.length > 0 && breakingNews.map((news, index) => (
                  <NewsItem key={`news-dup-${index}`} news={news} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for scrolling animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll linear infinite;
        }

        /* Adjust speed based on number of items - faster speed */
        .animate-scroll {
          animation-duration: ${Math.max(20, breakingNews.length * 5)}s;
        }
      `}</style>
    </div>
  );
}

// Separate NewsItem component for rendering individual news/announcement
function NewsItem({ news }: { news: BreakingNews }) {
  // Default to 'breaking' if type is undefined (for backwards compatibility)
  const isBreaking = !news.type || news.type === 'breaking';
  
  // Determine link
  const getLink = () => {
    if (news.article_id && news.article) {
      return `/news/${news.article.slug}`;
    }
    if (news.link_url) {
      return news.link_url;
    }
    return null;
  };

  const link = getLink();
  const isExternalLink = link?.startsWith("http");

  const content = (
    <div className="flex items-center gap-2 flex-shrink-0 group">
      {/* Type Badge */}
      {isBreaking ? (
        <span className="flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
          <Flame className="h-3 w-3" />
          BREAKING
        </span>
      ) : (
        <span className="flex items-center gap-1 rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
          <Megaphone className="h-3 w-3" />
          ANNOUNCEMENT
        </span>
      )}

      {/* Headline */}
      <span className="whitespace-nowrap text-sm font-medium text-text-primary group-hover:text-vntv-red transition-colors">
        {news.headline_override}
      </span>

      {/* Separator */}
      <span className="text-text-tertiary mx-2">•</span>
    </div>
  );

  if (!link) {
    return content;
  }

  if (isExternalLink) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={link} className="cursor-pointer">
      {content}
    </Link>
  );
}
