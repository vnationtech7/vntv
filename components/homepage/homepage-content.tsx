"use client";

import { useState, useEffect } from "react";
import { LatestNewsSection } from "./latest-news-section";
import { TrendingSidebar } from "./trending-sidebar";
import { getLatestArticles } from "@/app/actions/homepage";

interface HomePageContentProps {
  initialLatestArticles: any[];
  trendingArticles: any[];
}

export function HomePageContent({
  initialLatestArticles,
  trendingArticles,
}: HomePageContentProps) {
  const [latestArticles, setLatestArticles] = useState(initialLatestArticles);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleExpandChange = async (expanded: boolean) => {
    setIsExpanded(expanded);

    // Desktop only: Fetch more articles when expanding
    if (expanded && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsLoading(true);
      try {
        const result = await getLatestArticles(12); // Fetch 12 items when expanded (6 initial + 6 more)
        if (result.data) {
          setLatestArticles(result.data);
        }
      } catch (error) {
        console.error("Error fetching expanded articles:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (!expanded) {
      // Reset to initial 6 items when collapsing
      setLatestArticles(initialLatestArticles);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2.4fr_1fr] gap-6">
      {/* Latest News Column */}
      <div className={isLoading ? "opacity-50 transition-opacity" : ""}>
        <LatestNewsSection articles={latestArticles} />
      </div>
      
      {/* Trending Sidebar Column */}
      <div className="py-8">
        {/* Section Header - Matches Latest News header positioning */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-3 text-base font-extrabold tracking-wide">
            <span className="w-1 h-4 bg-[--red] rounded-sm" />
            TRENDING NOW
          </h2>
        </div>
        <TrendingSidebar
          articles={trendingArticles}
          onExpandChange={handleExpandChange}
        />
      </div>
    </div>
  );
}
