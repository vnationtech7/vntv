import { PublicLayout } from "@/components/layout";
import { Suspense } from "react";
import {
  HeroSection,
  LatestNewsSection,
  TrendingSidebar,
  VideoSection,
  CategoryStrip,
  OriginalsSection,
} from "@/components/homepage";
import {
  getFeaturedContent,
  getLatestArticles,
  getTrendingArticles,
  getLatestVideos,
} from "./actions/homepage";

export default async function HomePage() {
  // Fetch all data in parallel
  const [featuredResult, latestResult, trendingResult, videosResult] =
    await Promise.all([
      getFeaturedContent(5), // Changed from getFeaturedArticles
      getLatestArticles(8),
      getTrendingArticles(5),
      getLatestVideos(4),
    ]);

  const featuredContent = featuredResult.data || [];
  const latestArticles = latestResult.data || [];
  const trendingArticles = trendingResult.data || [];
  const videos = videosResult.data || [];

  return (
    <PublicLayout>
      {/* Hero Section - Articles AND Videos */}
      <Suspense fallback={<div className="h-[600px] bg-surface-secondary animate-pulse" />}>
        <HeroSection content={featuredContent} />
      </Suspense>

      {/* Main Content Area with 2-Column Layout */}
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Latest News + Trending Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[2.4fr_1fr] gap-6 items-start">
          <Suspense fallback={<div className="h-96 bg-surface-secondary animate-pulse rounded-lg" />}>
            <LatestNewsSection articles={latestArticles} />
          </Suspense>
          <Suspense fallback={<div className="h-96 bg-surface-secondary animate-pulse rounded-lg" />}>
            <TrendingSidebar articles={trendingArticles} />
          </Suspense>
        </div>

        {/* Videos Section (Full Width) */}
        <Suspense fallback={<div className="h-64 bg-surface-secondary animate-pulse rounded-lg my-8" />}>
          <VideoSection videos={videos} />
        </Suspense>

        {/* VNTV Originals with Programmes */}
        <Suspense fallback={<div className="h-96 bg-surface-secondary animate-pulse rounded-lg my-8" />}>
          <OriginalsSection />
        </Suspense>

        {/* Category Icons Strip (Full Width) */}
        <CategoryStrip />
      </div>
    </PublicLayout>
  );
}
