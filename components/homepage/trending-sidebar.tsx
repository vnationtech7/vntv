"use client";

import { TrendingItem } from "@/components/content";

interface TrendingSidebarProps {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    published_at: string;
    view_count?: number;
    content_type?: "article" | "rss";
  }>;
}

export function TrendingSidebar({ articles }: TrendingSidebarProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <aside className="sticky top-20">
      <div className="bg-[--panel] border border-[--border] rounded-lg p-5">
        {/* Section Header */}
        <h2 className="flex items-center gap-3 text-base font-extrabold tracking-wide mb-4">
          <span className="w-1 h-4 bg-[--red] rounded-sm" />
          TRENDING NOW
        </h2>

        {/* Trending List */}
        <div className="space-y-0">
          {articles.map((article, index) => (
            <TrendingItem
              key={article.id}
              rank={index + 1}
              id={article.id}
              title={article.title}
              slug={article.slug}
              publishedAt={article.published_at}
              viewCount={article.view_count || 0}
              showBorder={index < articles.length - 1}
              contentType={article.content_type || "article"}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
