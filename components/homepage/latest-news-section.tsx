"use client";

import { ContentCard } from "@/components/content";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface LatestNewsSectionProps {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string;
    content_type?: "article" | "rss";
    category: { id: string; name: string; slug: string } | null;
    author: { id: string; name: string; slug: string } | null;
    author_name?: string; // For RSS items
    source_name?: string; // For RSS items
    featured_image?: { id: string; storage_path: string; alt_text: string | null } | null;
    image_url?: string | null; // For RSS items
  }>;
}

export function LatestNewsSection({ articles }: LatestNewsSectionProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-3 text-base font-extrabold tracking-wide">
          <span className="w-1 h-4 bg-[--red] rounded-sm" />
          LATEST NEWS
        </h2>
        <Link
          href="/rss-feeds"
          className="flex items-center gap-1 text-xs font-bold text-[--muted] hover:text-[--red] transition-colors"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Articles Grid - 2 items per row for bigger cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <ContentCard
            key={article.id}
            id={article.id}
            title={article.title}
            slug={article.slug}
            excerpt={article.excerpt}
            publishedAt={article.published_at}
            categoryName={article.category?.name}
            categorySlug={article.category?.slug}
            authorName={
              article.content_type === "rss"
                ? article.author_name
                : article.author?.name
            }
            imagePath={article.featured_image?.storage_path}
            imageUrl={article.image_url}
            imageAlt={article.featured_image?.alt_text}
            variant="horizontal"
            contentType={article.content_type || "article"}
            sourceName={article.source_name}
          />
        ))}
      </div>
    </section>
  );
}
