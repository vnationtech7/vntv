// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAndParseRssFeed } from "@/lib/rss/parser";

/**
 * RSS Ingestion API Route
 * Called by Supabase pg_cron every 4 hours to fetch and import RSS feeds
 * Can also be called manually for testing
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authorization (service role or admin only)
    const authHeader = request.headers.get("authorization");
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Check if request is from Supabase cron or has valid auth
    const isServiceRequest = authHeader === `Bearer ${serviceKey}`;
    
    if (!isServiceRequest) {
      // Check if user is authenticated and is admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Check if user has admin role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "super_admin") {
        return NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { status: 403 }
        );
      }
    }

    // Get enabled feeds that need fetching
    const { data: feeds, error: feedsError } = await supabase
      .from("rss_feeds")
      .select("*")
      .eq("is_enabled", true)
      .order("last_fetched_at", { ascending: true, nullsFirst: true });

    if (feedsError) {
      console.error("Error fetching RSS feeds:", feedsError);
      return NextResponse.json(
        { error: "Failed to fetch RSS feeds", details: feedsError.message },
        { status: 500 }
      );
    }

    if (!feeds || feeds.length === 0) {
      return NextResponse.json({
        message: "No enabled RSS feeds to process",
        processed: 0,
      });
    }

    const results = {
      total: feeds.length,
      successful: 0,
      failed: 0,
      feeds: [] as any[],
    };

    // Process each feed
    for (const feed of feeds) {
      const feedResult = await processFeed(supabase, feed);
      results.feeds.push(feedResult);
      
      if (feedResult.success) {
        results.successful++;
      } else {
        results.failed++;
      }
    }

    return NextResponse.json({
      message: `Processed ${results.total} feeds`,
      results,
    });
  } catch (error) {
    console.error("RSS ingestion error:", error);
    return NextResponse.json(
      {
        error: "RSS ingestion failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Process a single RSS feed
 */
async function processFeed(supabase: any, feed: any) {
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

/**
 * GET method for manual triggering from admin panel
 */
export async function GET(request: NextRequest) {
  // Forward to POST handler
  return POST(request);
}
