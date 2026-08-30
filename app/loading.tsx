import { PublicLayout } from "@/components/layout";
import {
  HeroSkeleton,
  BreakingNewsTickerSkeleton,
  ArticleCardSkeleton,
  VideoCardSkeleton,
  TrendingItemSkeleton,
} from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <PublicLayout>
      {/* Breaking News Ticker Skeleton */}
      <BreakingNewsTickerSkeleton />

      {/* Hero Skeleton */}
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <HeroSkeleton />
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Latest News + Trending Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[2.4fr_1fr] gap-6 items-start">
          {/* Latest News Skeleton */}
          <section className="py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="h-5 w-32 bg-[--panel] animate-pulse rounded" />
              <div className="h-4 w-20 bg-[--panel] animate-pulse rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          </section>

          {/* Trending Sidebar Skeleton */}
          <aside className="sticky top-20">
            <div className="bg-[--panel] border border-[--border] rounded-lg p-5">
              <div className="h-5 w-36 bg-[--panel-2] animate-pulse rounded mb-4" />
              {[1, 2, 3, 4, 5].map((i) => (
                <TrendingItemSkeleton key={i} />
              ))}
            </div>
          </aside>
        </div>

        {/* Videos Section Skeleton */}
        <section className="py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 w-28 bg-[--panel] animate-pulse rounded" />
            <div className="h-4 w-20 bg-[--panel] animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
