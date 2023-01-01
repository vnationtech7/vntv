"use client";

import { useState } from "react";
import { TrendingItem } from "@/components/content";
import { HomepageSidebar } from "@/components/ads";

interface TrendingSidebarProps {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    published_at: string;
    view_count?: number;
    content_type?: "article" | "rss";
  }>;
  onExpandChange?: (isExpanded: boolean) => void;
}

export function TrendingSidebar({ articles, onExpandChange }: TrendingSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!articles || articles.length === 0) {
    return null;
  }

  const handleToggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    // Notify parent component about the expansion change
    if (onExpandChange) {
      onExpandChange(newExpandedState);
    }
  };

  return (
    <aside>
      <div className="bg-[--panel] border border-[--border] rounded-lg p-5">
        <div className="space-y-0">
          {/* First 3 items - Always visible */}
          {articles.slice(0, 3).map((article, index) => (
            <TrendingItem
              key={article.id}
              rank={index + 1}
              id={article.id}
              title={article.title}
              slug={article.slug}
              publishedAt={article.published_at}
              viewCount={article.view_count || 0}
              showBorder={true}
              contentType={article.content_type || "article"}
            />
          ))}

          {/* Show All Button - Desktop only, shown when not expanded */}
          {!isExpanded && articles.length > 3 && (
            <div className="hidden lg:block border-t border-[--border] py-4">
              <button
                onClick={handleToggleExpand}
                className="w-full px-4 py-2 text-sm font-semibold text-[--red] hover:bg-[--red]/10 rounded-md transition-colors duration-200"
              >
                Show All ({articles.length} items)
              </button>
            </div>
          )}

          {/* Ad - Hidden on mobile, shown on desktop below button or at 4th position when expanded */}
          <div className="hidden lg:block border-t border-[--border] py-4">
            <HomepageSidebar />
          </div>

          {/* Expanded items (4-10) - Scrollable when expanded on desktop, always shown on mobile */}
          {isExpanded && (
            <>
              <div className="hidden lg:block overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {articles.slice(3, 10).map((article, index) => (
                  <TrendingItem
                    key={article.id}
                    rank={index + 4}
                    id={article.id}
                    title={article.title}
                    slug={article.slug}
                    publishedAt={article.published_at}
                    viewCount={article.view_count || 0}
                    showBorder={index < articles.slice(3, 10).length - 1}
                    contentType={article.content_type || "article"}
                  />
                ))}
              </div>

              {/* Show Less Button - Desktop only */}
              <div className="hidden lg:block border-t border-[--border] py-4">
                <button
                  onClick={handleToggleExpand}
                  className="w-full px-4 py-2 text-sm font-semibold text-[--text-secondary] hover:bg-[--surface-secondary] rounded-md transition-colors duration-200"
                >
                  Show Less
                </button>
              </div>
            </>
          )}

          {/* Mobile: Show all items in scrollable container */}
          <div className="lg:hidden overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {articles.slice(3, 10).map((article, index) => (
              <TrendingItem
                key={article.id}
                rank={index + 4}
                id={article.id}
                title={article.title}
                slug={article.slug}
                publishedAt={article.published_at}
                viewCount={article.view_count || 0}
                showBorder={index < articles.slice(3, 10).length - 1}
                contentType={article.content_type || "article"}
              />
            ))}
          </div>
        </div>

        {/* Mobile Ad - Below all items on mobile */}
        <div className="lg:hidden mt-4 pt-4 border-t border-[--border]">
          <HomepageSidebar />
        </div>
      </div>
    </aside>
  );
}
