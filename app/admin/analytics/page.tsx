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
  getViewsOverTime,
  getContentTypeDistribution,
  getRssAnalytics,
  getVideoEngagementBreakdown,
} from "@/app/actions/analytics";
import { getTrendingArticlesAdvanced } from "@/app/actions/trending";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Eye, Share2, Search, Users, FileText, Video, Rss, Activity } from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  const [viewsOverTime, setViewsOverTime] = useState<any[]>([]);
  const [contentDist, setContentDist] = useState<any[]>([]);
  const [rssAnalytics, setRssAnalytics] = useState<any>(null);
  const [videoEngagement, setVideoEngagement] = useState<any>(null);

  // Chart colors
  const COLORS = ['#E31C25', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

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
        viewsTimeRes,
        contentDistRes,
        rssRes,
        videoEngRes,
      ] = await Promise.all([
        getAnalyticsSummary(timeRange),
        getTopArticles(10, timeRange === "today" ? "week" : timeRange),
        getTopVideos(10, timeRange === "today" ? "week" : timeRange),
        getTrendingArticlesAdvanced(10, timeRange === "week" ? 7 : 30),
        getCategoryPerformance(10),
        getAuthorPerformance(10),
        getTopSearches(20, timeRange === "today" ? "week" : timeRange),
        getSocialSharesAnalytics(timeRange === "today" ? "week" : timeRange),
        getViewsOverTime(timeRange === "week" ? 7 : timeRange === "month" ? 30 : 7),
        getContentTypeDistribution(),
        getRssAnalytics(timeRange === "today" ? "week" : timeRange === "all" ? "month" : timeRange),
        getVideoEngagementBreakdown(timeRange === "today" ? "week" : timeRange === "all" ? "month" : timeRange),
      ]);

      setSummary(summaryRes.data);
      setTopArticles(articlesRes.data || []);
      setTopVideos(videosRes.data || []);
      setTrendingArticles(trendingRes.data || []);
      setCategoryPerf(categoryRes.data || []);
      setAuthorPerf(authorRes.data || []);
      setTopSearches(searchesRes.data || []);
      setSocialShares(sharesRes.data);
      setViewsOverTime(viewsTimeRes.data || []);
      setContentDist(contentDistRes.data || []);
      setRssAnalytics(rssRes.data);
      setVideoEngagement(videoEngRes.data);
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

          {/* Visual Analytics Charts */}
          {!loading && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Views Over Time Line Chart */}
              {viewsOverTime.length > 0 && (
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Views Over Time
                    </CardTitle>
                    <CardDescription>Daily view trends for articles and videos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={viewsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="dateLabel" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="articleViews"
                          stackId="1"
                          stroke="#4ECDC4"
                          fill="#4ECDC4"
                          name="Article Views"
                        />
                        <Area
                          type="monotone"
                          dataKey="videoViews"
                          stackId="1"
                          stroke="#E31C25"
                          fill="#E31C25"
                          name="Video Views"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Content Type Distribution Pie Chart */}
              {contentDist.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Content Distribution</CardTitle>
                    <CardDescription>Views by content type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={contentDist.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {contentDist.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Video Engagement Bar Chart */}
              {videoEngagement && (
                <Card>
                  <CardHeader>
                    <CardTitle>Video Engagement Funnel</CardTitle>
                    <CardDescription>User journey through video content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          { name: "Views", count: videoEngagement.views },
                          { name: "Starts", count: videoEngagement.starts },
                          { name: "25%", count: videoEngagement.progress25 },
                          { name: "50%", count: videoEngagement.progress50 },
                          { name: "75%", count: videoEngagement.progress75 },
                          { name: "Complete", count: videoEngagement.completions },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        />
                        <Bar dataKey="count" fill="#E31C25" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary">Completion Rate:</span>
                        <span className="ml-2 font-bold text-green-500">{videoEngagement.completionRate}%</span>
                      </div>
                      <div>
                        <span className="text-text-secondary">Gate Conversion:</span>
                        <span className="ml-2 font-bold text-blue-500">{videoEngagement.gateConversionRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* RSS Analytics Card */}
              {rssAnalytics && (
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rss className="h-5 w-5" />
                      RSS Feed Analytics
                    </CardTitle>
                    <CardDescription>RSS content pipeline status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-background-panel rounded-lg">
                        <div className="text-2xl font-bold text-yellow-500">{rssAnalytics.pendingItems}</div>
                        <div className="text-xs text-text-secondary mt-1">Pending Review</div>
                      </div>
                      <div className="text-center p-4 bg-background-panel rounded-lg">
                        <div className="text-2xl font-bold text-green-500">{rssAnalytics.approvedItems}</div>
                        <div className="text-xs text-text-secondary mt-1">Approved</div>
                      </div>
                      <div className="text-center p-4 bg-background-panel rounded-lg">
                        <div className="text-2xl font-bold text-blue-500">{rssAnalytics.publishedItems}</div>
                        <div className="text-xs text-text-secondary mt-1">Published</div>
                      </div>
                      <div className="text-center p-4 bg-background-panel rounded-lg">
                        <div className="text-2xl font-bold text-red-500">{rssAnalytics.rejectedItems}</div>
                        <div className="text-xs text-text-secondary mt-1">Rejected</div>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-text-secondary text-center">
                      {rssAnalytics.activeFeeds} active feeds out of {rssAnalytics.totalFeeds} total
                    </div>
                  </CardContent>
                </Card>
              )}
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
              <TabsTrigger value="rss">RSS Feeds</TabsTrigger>
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
                            <span className="text-xs text-text-secondary w-24 text-right">
                              {category.article_count} articles
                              {category.rss_item_count > 0 && `, ${category.rss_item_count} RSS`}
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

            {/* RSS Feeds Tab */}
            <TabsContent value="rss" className="space-y-4">
              {rssAnalytics && (
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Rss className="h-5 w-5" />
                        RSS Pipeline Overview
                      </CardTitle>
                      <CardDescription>Content approval workflow statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Status Breakdown */}
                        <div>
                          <h4 className="text-sm font-medium mb-4">Content Status</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                              <span className="font-medium text-yellow-500">Pending Review</span>
                              <span className="text-2xl font-bold text-yellow-500">{rssAnalytics.pendingItems}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                              <span className="font-medium text-green-500">Approved</span>
                              <span className="text-2xl font-bold text-green-500">{rssAnalytics.approvedItems}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                              <span className="font-medium text-blue-500">Published</span>
                              <span className="text-2xl font-bold text-blue-500">{rssAnalytics.publishedItems}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                              <span className="font-medium text-red-500">Rejected</span>
                              <span className="text-2xl font-bold text-red-500">{rssAnalytics.rejectedItems}</span>
                            </div>
                          </div>
                        </div>

                        {/* Feed Status */}
                        <div className="pt-6 border-t border-border">
                          <h4 className="text-sm font-medium mb-4">Feed Status</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-background-panel rounded-lg text-center">
                              <div className="text-3xl font-bold text-vntv-red">{rssAnalytics.activeFeeds}</div>
                              <div className="text-sm text-text-secondary mt-1">Active Feeds</div>
                            </div>
                            <div className="p-4 bg-background-panel rounded-lg text-center">
                              <div className="text-3xl font-bold text-text-primary">{rssAnalytics.totalFeeds}</div>
                              <div className="text-sm text-text-secondary mt-1">Total Feeds</div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="pt-6 border-t border-border">
                          <h4 className="text-sm font-medium mb-4">Quick Actions</h4>
                          <div className="flex gap-3">
                            <Link
                              href="/admin/rss/items?status=pending"
                              className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-center font-medium"
                            >
                              Review Pending ({rssAnalytics.pendingItems})
                            </Link>
                            <Link
                              href="/admin/rss"
                              className="flex-1 px-4 py-3 bg-background-panel border border-border rounded-lg hover:bg-background-panel/80 transition-colors text-center font-medium"
                            >
                              Manage Feeds
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
