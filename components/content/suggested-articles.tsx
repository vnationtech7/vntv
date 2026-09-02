"use client";

import { ArticleCard } from "./article-card";

interface SuggestedArticlesProps {
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string;
    featured_image?: {
      storage_path: string;
      alt_text?: string;
    } | null;
    category?: {
      name: string;
      slug: string;
    } | null;
    author?: {
      name: string;
    } | null;
  }>;
  title?: string;
  className?: string;
}

export function SuggestedArticles({
  articles,
  title = "Related Articles",
  className = "",
}: SuggestedArticlesProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h2 className="flex items-center gap-3 text-base font-extrabold tracking-wide mb-6">
        <span className="w-1 h-4 bg-[--red] rounded-sm" />
        {title.toUpperCase()}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {articles.map((article) => (
          <ArticleCard
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
            variant="default"
          />
        ))}
      </div>
    </div>
  );
}
