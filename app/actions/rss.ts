// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { fetchAndParseRssFeed } from "@/lib/rss/parser";

export type RssFeed = {
  id: string;
  name: string;
  url: string;
  source_name: string;
  country: string | null;
  category_id: string | null;
  is_enabled: boolean;
  auto_publish: boolean;
  requires_review: boolean;
  fetch_interval: number;
  last_fetched_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type RssItem = {
  id: string;
  feed_id: string;
  external_id: string | null;
  guid: string | null;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  author: string | null;
  image_url: string | null;
  published_at: string | null;
  fetched_at: string;
  status: "pending" | "approved" | "rejected" | "published";
  article_id: string | null;
  content_hash: string | null;
  created_at: string;
  feed?: {
    id: string;
    name: string;
    source_name: string;
  } | null;
};

export type RssImportLog = {
  id: string;
  feed_id: string;
  started_at: string;
  completed_at: string | null;
  status: "running" | "success" | "failed";
  items_found: number;
  items_imported: number;
  duplicates_found: number;
  errors: any[];
};

/**
 * Get all RSS feeds
 */
export async function getRssFeeds(filters?: {
  enabled?: boolean;
  search?: string;
}) {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("rss_feeds")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .order("created_at", { ascending: false });

    if (filters?.enabled !== undefined) {
      query = query.eq("is_enabled", filters.enabled);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,source_name.ilike.%${filters.search}%,url.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching RSS feeds:", error);
      return { data: null, error: error.message };
    }

    return { data: data as RssFeed[], error: null };
  } catch (err) {
    console.error("Error fetching RSS feeds:", err);
    return { data: null, error: "Failed to fetch RSS feeds" };
  }
}

/**
 * Get single RSS feed by ID
 */
export async function getRssFeed(id: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("rss_feeds")
      .select(`
        *,
        category:categories(id, name, slug)
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return { data: null, error: "Feed not found" };
    }

    return { data: data as RssFeed, error: null };
  } catch (err) {
    console.error("Error fetching RSS feed:", err);
    return { data: null, error: "Failed to fetch RSS feed" };
  }
}

/**
 * Create new RSS feed
 */
export async function createRssFeed(feedData: {
  name: string;
  url: string;
  source_name: string;
  country?: string;
  category_id?: string;
  is_enabled?: boolean;
  auto_publish?: boolean;
  requires_review?: boolean;
  fetch_interval?: number;
}) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("rss_feeds")
      .insert({
        name: feedData.name,
        url: feedData.url,
        source_name: feedData.source_name,
        country: feedData.country || null,
        category_id: feedData.category_id || null,
        is_enabled: feedData.is_enabled ?? true,
        auto_publish: feedData.auto_publish ?? false,
        requires_review: feedData.requires_review ?? true,
        fetch_interval: feedData.fetch_interval || 3600,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating RSS feed:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/admin/rss");
    return { data, error: null };
  } catch (err) {
    console.error("Error creating RSS feed:", err);
    return { data: null, error: "Failed to create RSS feed" };
  }
}

/**
 * Update RSS feed
 */
export async function updateRssFeed(
  id: string,
  feedData: {
    name?: string;
    url?: string;
    source_name?: string;
    country?: string;
    category_id?: string;
    is_enabled?: boolean;
    auto_publish?: boolean;
    requires_review?: boolean;
    fetch_interval?: number;
  }
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("rss_feeds")
      .update({
        ...feedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating RSS feed:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/admin/rss");
    return { data, error: null };
  } catch (err) {
    console.error("Error updating RSS feed:", err);
    return { data: null, error: "Failed to update RSS feed" };
  }
}

/**
 * Delete RSS feed
 */
export async function deleteRssFeed(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("rss_feeds")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting RSS feed:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/rss");
    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting RSS feed:", err);
    return { success: false, error: "Failed to delete RSS feed" };
  }
}

/**
 * Get RSS items for review
 */
export async function getRssItems(filters?: {
  feedId?: string;
  status?: "pending" | "approved" | "rejected" | "published";
  limit?: number;
  offset?: number;
}) {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("rss_items")
      .select(`
        *,
        feed:rss_feeds(id, name, source_name)
      `)
      .order("fetched_at", { ascending: false });

    if (filters?.feedId) {
      query = query.eq("feed_id", filters.feedId);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 20) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching RSS items:", error);
      return { data: null, error: error.message };
    }

    return { data: data as RssItem[], error: null };
  } catch (err) {
    console.error("Error fetching RSS items:", err);
    return { data: null, error: "Failed to fetch RSS items" };
  }
}

/**
 * Update RSS item status
 */
export async function updateRssItemStatus(
  id: string,
  status: "pending" | "approved" | "rejected" | "published"
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("rss_items")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating RSS item status:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/admin/rss/items");
    revalidatePath("/");
    
    return { data, error: null };
  } catch (err) {
    console.error("Error updating RSS item status:", err);
    return { data: null, error: "Failed to update RSS item status" };
  }
}

/**
 * Get RSS import logs
 */
export async function getRssImportLogs(feedId?: string, limit: number = 50) {
  const supabase = await createClient();

  try {
    let query = supabase
      .from("rss_import_logs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(limit);

    if (feedId) {
      query = query.eq("feed_id", feedId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching RSS import logs:", error);
      return { data: null, error: error.message };
    }

    return { data: data as RssImportLog[], error: null };
  } catch (err) {
    console.error("Error fetching RSS import logs:", err);
    return { data: null, error: "Failed to fetch RSS import logs" };
  }
}

/**
 * Delete RSS item
 */
export async function deleteRssItem(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("rss_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting RSS item:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/rss/items");
    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting RSS item:", err);
    return { success: false, error: "Failed to delete RSS item" };
  }
}

/**
 * Bulk delete RSS items
 */
export async function bulkDeleteRssItems(itemIds: string[]) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("rss_items")
      .delete()
      .in("id", itemIds);

    if (error) {
      console.error("Error bulk deleting RSS items:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/rss/items");
    return { success: true, error: null };
  } catch (err) {
    console.error("Error bulk deleting RSS items:", err);
    return { success: false, error: "Failed to bulk delete RSS items" };
  }
}

/**
 * Get feed statistics
 */
export async function getRssFeedStats(feedId: string) {
  const supabase = await createClient();

  try {
    const { data: items, error } = await supabase
      .from("rss_items")
      .select("status")
      .eq("feed_id", feedId);

    if (error) {
      console.error("Error fetching RSS feed stats:", error);
      return { data: null, error: error.message };
    }

    const stats = {
      total: items.length,
      pending: items.filter((i) => i.status === "pending").length,
      approved: items.filter((i) => i.status === "approved").length,
      rejected: items.filter((i) => i.status === "rejected").length,
      published: items.filter((i) => i.status === "published").length,
    };

    return { data: stats, error: null };
  } catch (err) {
    console.error("Error fetching RSS feed stats:", err);
    return { data: null, error: "Failed to fetch RSS feed stats" };
  }
}

/**
 * Manually trigger RSS ingestion for all enabled feeds
 * (Processes feeds immediately)
 */
export async function triggerRssIngestion() {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized - Please log in",
      };
    }

    // Get enabled feeds
    const { data: feeds, error: feedsError } = await supabase
      .from("rss_feeds")
      .select("*")
      .eq("is_enabled", true)
      .order("last_fetched_at", { ascending: true, nullsFirst: true });

    if (feedsError) {
      console.error("Error fetching RSS feeds:", feedsError);
      return {
        success: false,
        error: "Failed to fetch RSS feeds",
      };
    }

    if (!feeds || feeds.length === 0) {
      return {
        success: true,
        data: { message: "No enabled RSS feeds to process", processed: 0 },
      };
    }

    const results = {
      total: feeds.length,
      successful: 0,
      failed: 0,
      feeds: [] as any[],
    };

    // Process each feed
    for (const feed of feeds) {
      const feedResult = await processSingleFeed(supabase, feed);
      results.feeds.push(feedResult);
      
      if (feedResult.success) {
        results.successful++;
      } else {
        results.failed++;
      }
    }

    revalidatePath("/admin/rss/monitoring");
    revalidatePath("/admin/rss/items");

    return {
      success: true,
      data: {
        message: `Processed ${results.total} feeds`,
        results,
      },
    };
  } catch (error) {
    console.error("Error triggering RSS ingestion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to trigger ingestion",
    };
  }
}

/**
 * Process a single RSS feed
 */
async function processSingleFeed(supabase: any, feed: any) {
  const logId = crypto.randomUUID();
  const startTime = new Date().toISOString();

  try {
    // Create import log
    await supabase.from("rss_import_logs").insert({
      id: logId,
      feed_id: feed.id,
      started_at: startTime,
      status: "running",
    });

    // Fetch and parse the feed
    const parseResult = await fetchAndParseRssFeed(feed.url);

    if (parseResult.error) {
      throw new Error(parseResult.error);
    }

    const items = parseResult.items || [];
    let itemsImported = 0;
    let duplicatesFound = 0;

    // Process each item
    for (const item of items) {
      try {
        // Check if item already exists (by content hash or guid)
        const { data: existing } = await supabase
          .from("rss_items")
          .select("id")
          .eq("feed_id", feed.id)
          .or(`content_hash.eq.${item.content_hash},guid.eq.${item.guid}`)
          .limit(1)
          .single();

        if (existing) {
          duplicatesFound++;
          continue;
        }

        // Determine initial status based on feed settings
        let status = "pending";
        if (feed.auto_publish && !feed.requires_review) {
          status = "approved";
        } else if (feed.requires_review) {
          status = "pending";
        }

        // Insert new item
        const { error: insertError } = await supabase
          .from("rss_items")
          .insert({
            feed_id: feed.id,
            external_id: item.external_id,
            guid: item.guid,
            title: item.title,
            description: item.description,
            content: item.content,
            url: item.url,
            author: item.author,
            image_url: item.image_url,
            published_at: item.published_at,
            fetched_at: new Date().toISOString(),
            status,
            content_hash: item.content_hash,
            raw_payload: item.raw_payload,
          });

        if (!insertError) {
          itemsImported++;
        }
      } catch (itemError) {
        console.error(`Error processing item from feed ${feed.id}:`, itemError);
        // Continue processing other items
      }
    }

    // Update feed last_fetched_at and last_success_at
    await supabase
      .from("rss_feeds")
      .update({
        last_fetched_at: new Date().toISOString(),
        last_success_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", feed.id);

    // Complete the import log
    await supabase
      .from("rss_import_logs")
      .update({
        completed_at: new Date().toISOString(),
        status: "success",
        items_found: items.length,
        items_imported: itemsImported,
        duplicates_found: duplicatesFound,
      })
      .eq("id", logId);

    return {
      feedId: feed.id,
      feedName: feed.name,
      success: true,
      itemsFound: items.length,
      itemsImported,
      duplicatesFound,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Update feed with error
    await supabase
      .from("rss_feeds")
      .update({
        last_fetched_at: new Date().toISOString(),
        last_error: errorMessage,
      })
      .eq("id", feed.id);

    // Complete the import log with error
    await supabase
      .from("rss_import_logs")
      .update({
        completed_at: new Date().toISOString(),
        status: "failed",
        errors: errorMessage,
      })
      .eq("id", logId);

    return {
      feedId: feed.id,
      feedName: feed.name,
      success: false,
      error: errorMessage,
    };
  }
}

export async function triggerSingleFeedIngestion(feedId: string) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized - Please log in",
      };
    }

    // Get the specific feed
    const { data: feed, error: feedError } = await supabase
      .from("rss_feeds")
      .select("*")
      .eq("id", feedId)
      .single();

    if (feedError || !feed) {
      return {
        success: false,
        error: "Feed not found",
      };
    }

    if (!feed.is_enabled) {
      return {
        success: false,
        error: "Feed is disabled",
      };
    }

    // Process the feed
    const result = await processSingleFeed(supabase, feed);

    revalidatePath("/admin/rss/monitoring");
    revalidatePath("/admin/rss/items");

    return {
      success: result.success,
      data: result,
    };
  } catch (error) {
    console.error("Error triggering feed ingestion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to trigger ingestion",
    };
  }
}
