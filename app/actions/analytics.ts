// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Get overall site analytics summary
 */
export async function getAnalyticsSummary(timeRange: "today" | "week" | "month" | "all" = "week") {
  const supabase = await createClient();

  try {
    // Calculate date range
    const now = new Date();
    let startDate: Date | null = null;

    switch (timeRange) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case "all":
        startDate = null;
        break;
    }

    // For articles: Use article_views for time-filtered data OR cumulative view_count for "all time"
    let articleViews = 0;
    
    if (timeRange === "all") {
      // All time: use cumulative view_count from articles table
      const { data: articlesData } = await supabase
        .from("articles")
        .select("view_count")
        .eq("status", "published");

      articleViews = articlesData?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0;
    } else {
      // Time-filtered: count ALL view events from article_views table (including deleted articles)
      let articleViewsQuery = supabase
        .from("article_views")
        .select("id", { count: "exact", head: true });

      if (startDate) {
        articleViewsQuery = articleViewsQuery.gte("viewed_at", startDate.toISOString());
      }

      const { count: articleViewEvents } = await articleViewsQuery;
      articleViews = articleViewEvents || 0;
    }

    // For videos: Use video_analytics for ALL view events (including deleted videos)
    let videoViews = 0;
    
    if (timeRange === "all") {
      // All time: Count ALL view events from video_analytics (including deleted videos)
      const { count: allVideoViews } = await supabase
        .from("video_analytics")
        .select("id", { count: "exact", head: true })
        .eq("event_type", "view");

      videoViews = allVideoViews || 0;
    } else {
      // Time-filtered: count view events from video_analytics table in time range
      let videoAnalyticsQuery = supabase
        .from("video_analytics")
        .select("id", { count: "exact", head: true })
        .eq("event_type", "view");

      if (startDate) {
        videoAnalyticsQuery = videoAnalyticsQuery.gte("created_at", startDate.toISOString());
      }

      const { count: videoViewEvents } = await videoAnalyticsQuery;
      videoViews = videoViewEvents || 0;
    }

    // Get social shares count
    let sharesQuery = supabase
      .from("social_shares")
      .select("id", { count: "exact", head: true });

    if (startDate) {
      sharesQuery = sharesQuery.gte("shared_at", startDate.toISOString());
    }

    const { count: socialShares } = await sharesQuery;

    // Get search queries count
    let searchesQuery = supabase
      .from("search_queries")
      .select("id", { count: "exact", head: true });

    if (startDate) {
      searchesQuery = searchesQuery.gte("created_at", startDate.toISOString());
    }

    const { count: searches } = await searchesQuery;

    // Get total published articles
    const { count: totalArticles } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");

    // Get total published videos
    const { count: totalVideos } = await supabase
      .from("videos")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");

    return {
      data: {
        articleViews: articleViews || 0,
        videoViews: videoViews || 0,
        socialShares: socialShares || 0,
        searches: searches || 0,
        totalArticles: totalArticles || 0,
        totalVideos: totalVideos || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching analytics summary:", error);
    return {
      data: null,
      error: "Failed to fetch analytics summary",
    };
  }
}

/**
 * Get top performing articles
 */
export async function getTopArticles(limit: number = 10, timeRange: "week" | "month" | "all" = "week") {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("articles")
      .select("id, title, slug, view_count, published_at, category:categories(name, slug), author:authors(name, slug)")
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("view_count", { ascending: false })
      .limit(limit);

    // Filter by time range if not "all"
    if (timeRange === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte("published_at", weekAgo.toISOString());
    } else if (timeRange === "month") {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      query = query.gte("published_at", monthAgo.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching top articles:", error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching top articles:", error);
    return { data: [], error: "Failed to fetch top articles" };
  }
}

/**
 * Get top performing videos
 */
export async function getTopVideos(limit: number = 10, timeRange: "week" | "month" | "all" = "week") {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("videos")
      .select("id, title, slug, view_count, video_type, published_at, category_id")
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("view_count", { ascending: false })
      .limit(limit);

    // Filter by time range if not "all"
    if (timeRange === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte("published_at", weekAgo.toISOString());
    } else if (timeRange === "month") {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      query = query.gte("published_at", monthAgo.toISOString());
    }

    const { data: videos, error } = await query;

    if (error) {
      console.error("Error fetching top videos:", error);
      return { data: [], error: error.message };
    }

    if (!videos || videos.length === 0) {
      return { data: [], error: null };
    }

    // Get categories separately
    const categoryIds = videos.map((v) => v.category_id).filter(Boolean);
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name, slug")
      .in("id", categoryIds);

    const categoriesMap = new Map(categories?.map((c: any) => [c.id, c]) || []);

    const enrichedVideos = videos.map((video) => ({
      ...video,
      category: video.category_id ? categoriesMap.get(video.category_id) || null : null,
    }));

    return { data: enrichedVideos, error: null };
  } catch (error) {
    console.error("Error fetching top videos:", error);
    return { data: [], error: "Failed to fetch top videos" };
  }
}

/**
 * Get category performance analytics (includes articles AND RSS items)
 */
export async function getCategoryPerformance(limit: number = 10) {
  const supabase = await createClient();

  try {
    // Get all categories with article counts and total views
    const { data: categories, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name");

    if (error || !categories) {
      return { data: [], error: error?.message || "Failed to fetch categories" };
    }

    // Get article counts, views, and RSS item counts for each category
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        // Article count
        const { count: articleCount } = await supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("category_id", category.id)
          .eq("status", "published");

        // Article views
        const { data: articles } = await supabase
          .from("articles")
          .select("view_count")
          .eq("category_id", category.id)
          .eq("status", "published");

        const articleViews = articles?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0;

        // RSS items count (approved)
        const { count: rssItemCount } = await supabase
          .from("rss_items")
          .select("id", { count: "exact", head: true })
          .eq("feed.category_id", category.id)
          .eq("status", "approved");

        // RSS feeds in this category
        const { count: rssFeedCount } = await supabase
          .from("rss_feeds")
          .select("id", { count: "exact", head: true })
          .eq("category_id", category.id);

        return {
          ...category,
          article_count: articleCount || 0,
          rss_item_count: rssItemCount || 0,
          rss_feed_count: rssFeedCount || 0,
          total_content: (articleCount || 0) + (rssItemCount || 0),
          total_views: articleViews,
        };
      })
    );

    // Sort by total views and limit
    const sortedStats = categoryStats
      .sort((a, b) => b.total_views - a.total_views)
      .slice(0, limit);

    return { data: sortedStats, error: null };
  } catch (error) {
    console.error("Error fetching category performance:", error);
    return { data: [], error: "Failed to fetch category performance" };
  }
}

/**
 * Get author performance analytics
 */
export async function getAuthorPerformance(limit: number = 10) {
  const supabase = await createClient();

  try {
    // Get all authors with article counts and total views
    const { data: authors, error } = await supabase
      .from("authors")
      .select("id, name, slug")
      .order("name");

    if (error || !authors) {
      return { data: [], error: error?.message || "Failed to fetch authors" };
    }

    // Get article counts and views for each author
    const authorStats = await Promise.all(
      authors.map(async (author) => {
        const { count: articleCount } = await supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("author_id", author.id)
          .eq("status", "published");

        const { data: articles } = await supabase
          .from("articles")
          .select("view_count")
          .eq("author_id", author.id)
          .eq("status", "published");

        const totalViews = articles?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0;

        return {
          ...author,
          article_count: articleCount || 0,
          total_views: totalViews,
        };
      })
    );

    // Sort by total views and limit
    const sortedStats = authorStats
      .sort((a, b) => b.total_views - a.total_views)
      .slice(0, limit);

    return { data: sortedStats, error: null };
  } catch (error) {
    console.error("Error fetching author performance:", error);
    return { data: [], error: "Failed to fetch author performance" };
  }
}

/**
 * Get top search queries
 */
export async function getTopSearches(limit: number = 20, timeRange: "week" | "month" | "all" = "week") {
  const supabase = await createClient();

  try {
    let startDate: Date | null = null;

    if (timeRange === "week") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === "month") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    // Get search queries grouped by query text
    let query = supabase
      .from("search_queries")
      .select("query, results_count, created_at");

    if (startDate) {
      query = query.gte("created_at", startDate.toISOString());
    }

    const { data: searches, error } = await query;

    if (error) {
      console.error("Error fetching search queries:", error);
      return { data: [], error: error.message };
    }

    // Group by query and count occurrences
    const queryMap = new Map<string, { query: string; count: number; avgResults: number }>();

    searches?.forEach((search) => {
      const existing = queryMap.get(search.query);
      if (existing) {
        existing.count++;
        existing.avgResults = (existing.avgResults + search.results_count) / 2;
      } else {
        queryMap.set(search.query, {
          query: search.query,
          count: 1,
          avgResults: search.results_count,
        });
      }
    });

    // Convert to array and sort by count
    const topSearches = Array.from(queryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return { data: topSearches, error: null };
  } catch (error) {
    console.error("Error fetching top searches:", error);
    return { data: [], error: "Failed to fetch top searches" };
  }
}

/**
 * Get social sharing analytics
 */
export async function getSocialSharesAnalytics(timeRange: "week" | "month" | "all" = "week") {
  const supabase = await createClient();

  try {
    let startDate: Date | null = null;

    if (timeRange === "week") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === "month") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    let query = supabase.from("social_shares").select("platform, content_type");

    if (startDate) {
      query = query.gte("shared_at", startDate.toISOString());
    }

    const { data: shares, error } = await query;

    if (error) {
      console.error("Error fetching social shares:", error);
      return { data: null, error: error.message };
    }

    // Group by platform
    const platformCounts: Record<string, number> = {};
    const contentTypeCounts: Record<string, number> = {};

    shares?.forEach((share) => {
      platformCounts[share.platform] = (platformCounts[share.platform] || 0) + 1;
      contentTypeCounts[share.content_type] = (contentTypeCounts[share.content_type] || 0) + 1;
    });

    return {
      data: {
        byPlatform: platformCounts,
        byContentType: contentTypeCounts,
        total: shares?.length || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching social shares analytics:", error);
    return { data: null, error: "Failed to fetch social shares analytics" };
  }
}

/**
 * Get video engagement metrics
 */
export async function getVideoEngagementMetrics(videoId?: string) {
  const supabase = await createClient();

  try {
    let query = supabase.from("video_analytics").select("event_type, video_id");

    if (videoId) {
      query = query.eq("video_id", videoId);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error("Error fetching video engagement:", error);
      return { data: null, error: error.message };
    }

    // Calculate metrics
    const metrics = {
      views: 0,
      starts: 0,
      progress_25: 0,
      progress_50: 0,
      progress_75: 0,
      completions: 0,
      gates_shown: 0,
      gates_authenticated: 0,
    };

    events?.forEach((event) => {
      if (event.event_type in metrics) {
        metrics[event.event_type as keyof typeof metrics]++;
      }
    });

    // Calculate rates
    const completionRate = metrics.starts > 0 
      ? ((metrics.completions / metrics.starts) * 100).toFixed(1)
      : "0.0";

    const gateConversionRate = metrics.gates_shown > 0
      ? ((metrics.gates_authenticated / metrics.gates_shown) * 100).toFixed(1)
      : "0.0";

    return {
      data: {
        ...metrics,
        completionRate: parseFloat(completionRate),
        gateConversionRate: parseFloat(gateConversionRate),
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching video engagement metrics:", error);
    return { data: null, error: "Failed to fetch video engagement metrics" };
  }
}


/**
 * Get views over time for charts (daily data for the past week/month)
 */
export async function getViewsOverTime(days: number = 7) {
  const supabase = await createClient();

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Generate array of dates
    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // Get articles with views
    const { data: articles } = await supabase
      .from("articles")
      .select("view_count, published_at")
      .eq("status", "published")
      .gte("published_at", startDate.toISOString())
      .lte("published_at", endDate.toISOString());

    // Get videos with views
    const { data: videos } = await supabase
      .from("videos")
      .select("view_count, published_at")
      .eq("status", "published")
      .gte("published_at", startDate.toISOString())
      .lte("published_at", endDate.toISOString());

    // Group by date
    const dataByDate = dates.map(date => {
      const articlesOnDate = articles?.filter(a => 
        a.published_at?.startsWith(date)
      ) || [];
      
      const videosOnDate = videos?.filter(v =>
        v.published_at?.startsWith(date)
      ) || [];

      const articleViews = articlesOnDate.reduce((sum, a) => sum + (a.view_count || 0), 0);
      const videoViews = videosOnDate.reduce((sum, v) => sum + (v.view_count || 0), 0);

      return {
        date: date,
        dateLabel: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        articleViews,
        videoViews,
        totalViews: articleViews + videoViews,
        articlesPublished: articlesOnDate.length,
        videosPublished: videosOnDate.length,
      };
    });

    return { data: dataByDate, error: null };
  } catch (error) {
    console.error("Error fetching views over time:", error);
    return { data: [], error: "Failed to fetch views over time" };
  }
}

/**
 * Get content type distribution for pie charts
 */
export async function getContentTypeDistribution() {
  const supabase = await createClient();

  try {
    // Get article stats
    const { data: articles } = await supabase
      .from("articles")
      .select("view_count")
      .eq("status", "published");

    // Get video stats by type
    const { data: fullVideos } = await supabase
      .from("videos")
      .select("view_count")
      .eq("status", "published")
      .eq("video_type", "full");

    const { data: shorts } = await supabase
      .from("videos")
      .select("view_count")
      .eq("status", "published")
      .eq("video_type", "short");

    const { data: clips } = await supabase
      .from("videos")
      .select("view_count")
      .eq("status", "published")
      .eq("video_type", "clip");

    const articleViews = articles?.reduce((sum, a) => sum + (a.view_count || 0), 0) || 0;
    const fullVideoViews = fullVideos?.reduce((sum, v) => sum + (v.view_count || 0), 0) || 0;
    const shortViews = shorts?.reduce((sum, s) => sum + (s.view_count || 0), 0) || 0;
    const clipViews = clips?.reduce((sum, c) => sum + (c.view_count || 0), 0) || 0;

    return {
      data: [
        { name: "Articles", value: articleViews, count: articles?.length || 0 },
        { name: "Full Videos", value: fullVideoViews, count: fullVideos?.length || 0 },
        { name: "Shorts", value: shortViews, count: shorts?.length || 0 },
        { name: "Clips", value: clipViews, count: clips?.length || 0 },
      ],
      error: null,
    };
  } catch (error) {
    console.error("Error fetching content type distribution:", error);
    return { data: [], error: "Failed to fetch content distribution" };
  }
}


/**
 * Get RSS analytics summary
 */
export async function getRssAnalytics(timeRange: "week" | "month" | "all" = "week") {
  const supabase = await createClient();

  try {
    let startDate: Date | null = null;

    if (timeRange === "week") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === "month") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    // Total RSS items
    let itemsQuery = supabase
      .from("rss_items")
      .select("id, status, fetched_at", { count: "exact" });

    if (startDate) {
      itemsQuery = itemsQuery.gte("fetched_at", startDate.toISOString());
    }

    const { data: items, count: totalItems } = await itemsQuery;

    const pendingItems = items?.filter(i => i.status === "pending").length || 0;
    const approvedItems = items?.filter(i => i.status === "approved").length || 0;
    const rejectedItems = items?.filter(i => i.status === "rejected").length || 0;
    const publishedItems = items?.filter(i => i.status === "published").length || 0;

    // Active feeds
    const { count: totalFeeds } = await supabase
      .from("rss_feeds")
      .select("id", { count: "exact", head: true });

    const { count: activeFeeds } = await supabase
      .from("rss_feeds")
      .select("id", { count: "exact", head: true })
      .eq("is_enabled", true);

    return {
      data: {
        totalItems: totalItems || 0,
        pendingItems,
        approvedItems,
        rejectedItems,
        publishedItems,
        totalFeeds: totalFeeds || 0,
        activeFeeds: activeFeeds || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching RSS analytics:", error);
    return { data: null, error: "Failed to fetch RSS analytics" };
  }
}

/**
 * Get video engagement breakdown (all event types)
 */
export async function getVideoEngagementBreakdown(timeRange: "week" | "month" | "all" = "week") {
  const supabase = await createClient();

  try {
    let startDate: Date | null = null;

    if (timeRange === "week") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === "month") {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    let query = supabase
      .from("video_analytics")
      .select("event_type");

    if (startDate) {
      query = query.gte("created_at", startDate.toISOString());
    }

    const { data: events } = await query;

    // Group by event type
    const eventCounts: Record<string, number> = {};
    events?.forEach(event => {
      eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
    });

    // Calculate engagement metrics
    const views = eventCounts["view"] || 0;
    const starts = eventCounts["video_start"] || eventCounts["start"] || 0;
    const progress25 = eventCounts["progress_25"] || 0;
    const progress50 = eventCounts["progress_50"] || 0;
    const progress75 = eventCounts["progress_75"] || 0;
    const completions = eventCounts["complete"] || eventCounts["video_complete"] || 0;
    const gatesShown = eventCounts["gate_shown"] || 0;
    const gatesAuth = eventCounts["gate_authenticated"] || 0;

    return {
      data: {
        views,
        starts,
        progress25,
        progress50,
        progress75,
        completions,
        gatesShown,
        gatesAuthenticated: gatesAuth,
        completionRate: starts > 0 ? ((completions / starts) * 100).toFixed(1) : "0",
        gateConversionRate: gatesShown > 0 ? ((gatesAuth / gatesShown) * 100).toFixed(1) : "0",
        eventBreakdown: eventCounts,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching video engagement breakdown:", error);
    return { data: null, error: "Failed to fetch video engagement" };
  }
}
