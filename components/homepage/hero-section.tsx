"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFeaturedArticles, type FeaturedArticle } from "@/app/actions/homepage";

export function HeroSection() {
  const [articles, setArticles] = useState<FeaturedArticle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedArticles();
  }, []);

  useEffect(() => {
    if (articles.length <= 1) return;

    // Auto-rotate every 8 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [articles.length]);

  const loadFeaturedArticles = async () => {
    setLoading(true);
    const { data } = await getFeaturedArticles(5);
    if (data && data.length > 0) {
      setArticles(data);
    }
    setLoading(false);
  };

  const getImageUrl = (storagePath: string | undefined) => {
    if (!storagePath) return null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/media/${storagePath}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const getReadTime = (excerpt: string | null) => {
    if (!excerpt) return "5 min read";
    const words = excerpt.split(" ").length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <section className="relative">
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main hero skeleton */}
            <div className="lg:col-span-2">
              <div className="relative aspect-[16/9] w-full animate-pulse overflow-hidden rounded-lg bg-background-panel" />
            </div>
            {/* Sidebar skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-background-panel" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  const mainArticle = articles[currentIndex];
  const sidebarArticles = articles.slice(1, 4);
  const imageUrl = mainArticle.featured_image?.storage_path
    ? getImageUrl(mainArticle.featured_image.storage_path)
    : null;

  return (
    <section className="relative bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Hero */}
          <div className="lg:col-span-2">
            <Link href={`/news/${mainArticle.slug}`} className="group block">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                {/* Image */}
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={mainArticle.featured_image?.alt_text || mainArticle.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-background-secondary to-background flex items-center justify-center">
                    <span className="text-4xl font-bold text-text-tertiary opacity-20">VNTV</span>
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  {/* Badges */}
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded bg-vntv-red px-2 py-1 text-xs font-bold uppercase text-white">
                      Top Story
                    </span>
                    {mainArticle.category && (
                      <span className="inline-flex items-center rounded bg-white/20 px-2 py-1 text-xs font-bold uppercase text-white backdrop-blur-sm">
                        {mainArticle.category.name}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="mb-3 text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl group-hover:text-vntv-red transition-colors">
                    {mainArticle.title}
                  </h2>

                  {/* Excerpt */}
                  {mainArticle.excerpt && (
                    <p className="mb-4 line-clamp-2 text-sm text-gray-200 md:text-base">
                      {mainArticle.excerpt}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300">
                    {mainArticle.author && (
                      <span className="font-medium">{mainArticle.author.name}</span>
                    )}
                    {mainArticle.published_at && (
                      <>
                        <span>•</span>
                        <span>{getTimeAgo(mainArticle.published_at)}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getReadTime(mainArticle.excerpt)}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-6">
                    <Button
                      variant="primary"
                      className="bg-vntv-red hover:bg-vntv-red/90"
                    >
                      Read Full Story
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Link>

            {/* Carousel Dots */}
            {articles.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                {articles.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "w-8 bg-vntv-red"
                        : "w-2 bg-border hover:bg-text-tertiary"
                    }`}
                    aria-label={`Go to story ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Secondary Stories */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
              More Top Stories
            </h3>
            {sidebarArticles.map((article) => {
              const sidebarImageUrl = article.featured_image?.storage_path
                ? getImageUrl(article.featured_image.storage_path)
                : null;

              return (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group block"
                >
                  <div className="flex gap-3 rounded-lg border border-border bg-background-panel p-3 transition-all hover:border-vntv-red hover:shadow-md">
                    {/* Thumbnail */}
                    {sidebarImageUrl && (
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded">
                        <img
                          src={sidebarImageUrl}
                          alt={article.featured_image?.alt_text || article.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {article.category && (
                        <span className="mb-1 inline-block text-xs font-bold uppercase text-vntv-red">
                          {article.category.name}
                        </span>
                      )}
                      <h4 className="mb-1 line-clamp-2 text-sm font-semibold text-text-primary group-hover:text-vntv-red transition-colors">
                        {article.title}
                      </h4>
                      {article.published_at && (
                        <p className="text-xs text-text-tertiary">
                          {getTimeAgo(article.published_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
