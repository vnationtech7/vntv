"use client";

import { ContentCard } from "@/components/content";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface ArticlesSectionProps {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string;
    category: { id: string; name: string; slug: string } | null;
    author: { id: string; name: string; slug: string } | null;
    featured_image?: { id: string; storage_path: string; alt_text: string | null } | null;
  }>;
}

export function ArticlesSection({ articles }: ArticlesSectionProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex items-center gap-3 text-base font-extrabold tracking-wide">
          <span className="w-1 h-4 bg-[--red] rounded-sm" />
          OUR ARTICLES
        </h2>
        <Link
          href="/news"
          className="flex items-center gap-1 text-xs font-bold text-[--muted] hover:text-[--red] transition-colors"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
            authorName={article.author?.name}
            imagePath={article.featured_image?.storage_path}
            imageAlt={article.featured_image?.alt_text}
            variant="compact"
            contentType="article"
          />
        ))}
      </div>
    </section>
  );
}
