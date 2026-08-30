// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAndParseRssFeed } from "@/lib/rss/parser";

/**
 * Single Feed RSS Ingestion API Route
 * Called manually to fetch and import a specific RSS feed
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ feedId: string }> }
) {
  try {
    const supabase = await createClient();
    const { feedId } = await params;

    // Check if user is authenticated and is admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the specific feed
    const { data: feed, error: feedError } = await supabase
      .from("rss_feeds")
      .select("*")
      .eq("id", feedId)
      .single();

    if (feedError || !feed) {
      return NextResponse.json(
        { error: "Feed not found" },
        { status: 404 }
      );
    }

    if (!feed.is_enabled) {
      return NextResponse.json(
        { error: "Feed is disabled" },
        { status: 400 }
      );
    }

    // Process the feed
    const result = await processFeed(supabase, feed);

    if (result.success) {
      return NextResponse.json({
        message: `Successfully processed feed: ${feed.name}`,
        result,
      });
    } else {
      return NextResponse.json(
        {
          error: "Feed processing failed",
          result,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("RSS single feed ingestion error:", error);
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
 * Process a single RSS feed (same logic as main ingest)
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
