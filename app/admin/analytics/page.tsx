"use client";

import { useEffect, useState } from "react";
import {
  getAnalyticsSummary,
  getTopArticles,
  getTopVideos,
  getCategoryPerformance,
  getAuthorPerformance,
  getTopSearches,
  getSocialSharesAnalytics,
} from "@/app/actions/analytics";
import { getTrendingArticlesAdvanced } from "@/app/actions/trending";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Eye, Share2, Search, Users, FileText, Video } from "lucide-react";
import Link from "next/link";

type TimeRange = "today" | "week" | "month" | "all";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [loading, setLoading] = useState(true);
  
  // Analytics data
  const [summary, setSummary] = useState<any>(null);
  const [topArticles, setTopArticles] = useState<any[]>([]);
  const [topVideos, setTopVideos] = useState<any[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<any[]>([]);
  const [categoryPerf, setCategoryPerf] = useState<any[]>([]);
  const [authorPerf, setAuthorPerf] = useState<any[]>([]);
  const [topSearches, setTopSearches] = useState<any[]>([]);
  const [socialShares, setSocialShares] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const [
        summaryRes,
        articlesRes,
        videosRes,
        trendingRes,
        categoryRes,
        authorRes,
        searchesRes,
        sharesRes,
      ] = await Promise.all([
        getAnalyticsSummary(timeRange),
        getTopArticles(10, timeRange === "today" ? "week" : timeRange),
        getTopVideos(10, timeRange === "today" ? "week" : timeRange),
        getTrendingArticlesAdvanced(10, timeRange === "week" ? 7 : 30),
        getCategoryPerformance(10),
        getAuthorPerformance(10),
        getTopSearches(20, timeRange === "today" ? "week" : timeRange),
        getSocialSharesAnalytics(timeRange === "today" ? "week" : timeRange),
      ]);

      setSummary(summaryRes.data);
      setTopArticles(articlesRes.data || []);
      setTopVideos(videosRes.data || []);
      setTrendingArticles(trendingRes.data || []);
      setCategoryPerf(categoryRes.data || []);
      setAuthorPerf(authorRes.data || []);
      setTopSearches(searchesRes.data || []);
      setSocialShares(sharesRes.data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Analytics Dashboard</h1>
        <p className="text-text-secondary mt-2">
          Track content performance, engagement, and user behavior
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(["today", "week", "month", "all"] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === range
                ? "bg-vntv-red text-white"
                : "bg-background-panel text-text-secondary hover:text-text-primary"
            }`}
          >
            {range === "today" ? "Today" : range === "week" ? "Last 7 Days" : range === "month" ? "Last 30 Days" : "All Time"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-text-secondary">Loading analytics...</div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Article Views</CardTitle>
                  <Eye className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.articleViews.toLocaleString()}</div>
                  <p className="text-xs text-text-secondary mt-1">
                    {summary.totalArticles} published articles
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Video Views</CardTitle>
                  <Video className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.videoViews.toLocaleString()}</div>
                  <p className="text-xs text-text-secondary mt-1">
                    {summary.totalVideos} published videos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Social Shares</CardTitle>
                  <Share2 className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.socialShares.toLocaleString()}</div>
                  <p className="text-xs text-text-secondary mt-1">
                    Across all platforms
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Searches</CardTitle>
                  <Search className="h-4 w-4 text-text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.searches.toLocaleString()}</div>
                  <p className="text-xs text-text-secondary mt-1">
                    Total search queries
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs for Different Analytics Views */}
          <Tabs defaultValue="trending" className="space-y-4">
            <TabsList>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="top-content">Top Content</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="authors">Authors</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
            </TabsList>

            {/* Trending Tab */}
            <TabsContent value="trending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trending Articles (Advanced Algorithm)
                  </CardTitle>
                  <CardDescription>
                    Score based on views (70%), shares (20%), and recency (10%)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trendingArticles.length === 0 ? (
                    <p className="text-text-secondary text-sm">No trending data available</p>
                  ) : (
                    <div className="space-y-4">
                      {trendingArticles.map((article, index) => (
                        <div key={article.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-vntv-red text-white flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/news/${article.slug}`}
                              className="font-medium hover:text-vntv-red transition-colors line-clamp-2"
                            >
                              {article.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary">
                              {article.category && (
                                <Badge variant="secondary">{article.category.name}</Badge>
                              )}
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {article.view_count} views
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="h-3 w-3" />
                                {article.share_count} shares
                              </span>
                              <span className="font-medium text-vntv-red">
                                Score: {article.trending_score}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Top Content Tab */}
            <TabsContent value="top-content" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Top Articles */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Top Articles
                    </CardTitle>
                    <CardDescription>Most viewed articles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topArticles.length === 0 ? (
                      <p className="text-text-secondary text-sm">No articles yet</p>
                    ) : (
                      <div className="space-y-3">
                        {topArticles.map((article, index) => (
                          <div key={article.id} className="flex items-start gap-3">
                            <span className="flex-shrink-0 text-lg font-bold text-text-secondary">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/news/${article.slug}`}
                                className="text-sm font-medium hover:text-vntv-red transition-colors line-clamp-1"
                              >
                                {article.title}
                              </Link>
                              <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                                <Eye className="h-3 w-3" />
                                {article.view_count} views
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Videos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Top Videos
                    </CardTitle>
                    <CardDescription>Most viewed videos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topVideos.length === 0 ? (
                      <p className="text-text-secondary text-sm">No videos yet</p>
                    ) : (
                      <div className="space-y-3">
                        {topVideos.map((video, index) => (
                          <div key={video.id} className="flex items-start gap-3">
                            <span className="flex-shrink-0 text-lg font-bold text-text-secondary">
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/video/${video.slug}`}
                                className="text-sm font-medium hover:text-vntv-red transition-colors line-clamp-1"
                              >
                                {video.title}
                              </Link>
                              <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                                <Eye className="h-3 w-3" />
                                {video.view_count} views
                                <Badge variant="secondary" className="text-xs">
                                  {video.video_type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Category Performance
                  </CardTitle>
                  <CardDescription>Total views and article count by category</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryPerf.length === 0 ? (
                    <p className="text-text-secondary text-sm">No category data available</p>
                  ) : (
                    <div className="space-y-4">
                      {categoryPerf.map((category) => (
                        <div key={category.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{category.name}</span>
                            <span className="text-sm text-text-secondary">
                              {category.total_views.toLocaleString()} views
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-background-panel rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-vntv-red h-full"
                                style={{
                                  width: `${Math.min(100, (category.total_views / (categoryPerf[0]?.total_views || 1)) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-text-secondary w-20 text-right">
                              {category.article_count} articles
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Authors Tab */}
            <TabsContent value="authors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Author Performance
                  </CardTitle>
                  <CardDescription>Total views and article count by author</CardDescription>
                </CardHeader>
                <CardContent>
                  {authorPerf.length === 0 ? (
                    <p className="text-text-secondary text-sm">No author data available</p>
                  ) : (
                    <div className="space-y-4">
                      {authorPerf.map((author) => (
                        <div key={author.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{author.name}</span>
                            <span className="text-sm text-text-secondary">
                              {author.total_views.toLocaleString()} views
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-background-panel rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-vntv-red h-full"
                                style={{
                                  width: `${Math.min(100, (author.total_views / (authorPerf[0]?.total_views || 1)) * 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-text-secondary w-20 text-right">
                              {author.article_count} articles
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Engagement Tab */}
            <TabsContent value="engagement" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Top Searches */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Top Search Queries
                    </CardTitle>
                    <CardDescription>Most popular searches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topSearches.length === 0 ? (
                      <p className="text-text-secondary text-sm">No search data yet</p>
                    ) : (
                      <div className="space-y-3">
                        {topSearches.slice(0, 10).map((search, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{search.query}</span>
                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                              <span>{search.count}×</span>
                              <span>({Math.round(search.avgResults)} results)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Social Shares */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="h-5 w-5" />
                      Social Shares
                    </CardTitle>
                    <CardDescription>Shares by platform and content type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!socialShares ? (
                      <p className="text-text-secondary text-sm">No sharing data yet</p>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">By Platform</h4>
                          <div className="space-y-2">
                            {Object.entries(socialShares.byPlatform).map(([platform, count]: [string, any]) => (
                              <div key={platform} className="flex items-center justify-between text-sm">
                                <span className="capitalize">{platform}</span>
                                <span className="text-text-secondary">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-medium mb-2">By Content Type</h4>
                          <div className="space-y-2">
                            {Object.entries(socialShares.byContentType).map(([type, count]: [string, any]) => (
                              <div key={type} className="flex items-center justify-between text-sm">
                                <span className="capitalize">{type}</span>
                                <span className="text-text-secondary">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
