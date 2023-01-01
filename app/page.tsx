import { PublicLayout } from "@/components/layout";
import { Suspense } from "react";
import {
  HeroSection,
  VideoSection,
  CategoryStrip,
  OriginalsSection,
  ShortsSection,
  ArticlesSection,
} from "@/components/homepage";
import {
  HomepageTopBanner,
  HomepageMidContent,
} from "@/components/ads";
import {
  getFeaturedContent,
  getLatestArticles,
  getTrendingArticles,
  getLatestVideos,
  getLatestShorts,
  getLatestPublishedArticles,
} from "./actions/homepage";
import { HomePageContent } from "@/components/homepage/homepage-content";

export default async function HomePage() {
  // Fetch all data in parallel
  const [featuredResult, latestResult, trendingResult, videosResult, shortsResult, articlesResult] =
    await Promise.all([
      getFeaturedContent(5),
      getLatestArticles(6), // Default 6 items (3 rows × 2 items), will be 12 when expanded
      getTrendingArticles(10),
      getLatestVideos(4),
      getLatestShorts(6),
      getLatestPublishedArticles(4),
    ]);

  const featuredContent = featuredResult.data || [];
  const latestArticles = latestResult.data || [];
  const trendingArticles = trendingResult.data || [];
  const videos = videosResult.data || [];
  const shorts = shortsResult.data || [];
  const articles = articlesResult.data || [];

  return (
    <PublicLayout>
      {/* Top Banner Ad */}
      <HomepageTopBanner />

      {/* Hero Section - Articles AND Videos */}
      <Suspense fallback={<div className="h-[600px] bg-surface-secondary animate-pulse" />}>
        <HeroSection content={featuredContent} />
      </Suspense>

      {/* Main Content Area */}
      <div className="max-w-[1280px] mx-auto px-6">
        {/* 1. VNTV Videos Section (Full Width) */}
        <Suspense fallback={<div className="h-64 bg-surface-secondary animate-pulse rounded-lg my-8" />}>
          <VideoSection videos={videos} />
        </Suspense>

        {/* 2. Latest News + Trending Sidebar */}
        <HomePageContent
          initialLatestArticles={latestArticles}
          trendingArticles={trendingArticles}
        />

        {/* Mid-Content Ad */}
        <HomepageMidContent />

        {/* 3. VNTV Originals with Programmes */}
        <Suspense fallback={<div className="h-96 bg-surface-secondary animate-pulse rounded-lg my-8" />}>
          <OriginalsSection />
        </Suspense>

        {/* 4. Shorts Section */}
        <Suspense fallback={<div className="h-64 bg-surface-secondary animate-pulse rounded-lg my-8" />}>
          <ShortsSection shorts={shorts} />
        </Suspense>

        {/* 5. Our Articles Section */}
        <Suspense fallback={<div className="h-64 bg-surface-secondary animate-pulse rounded-lg my-8" />}>
          <ArticlesSection articles={articles} />
        </Suspense>

        {/* 6. Category Icons Strip */}
        <CategoryStrip />
      </div>
    </PublicLayout>
  );
}
