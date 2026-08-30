import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAndParseRssFeed } from "@/lib/rss/parser";

/**
 * RSS Feed Test API Route
 * Tests if an RSS feed URL is valid and parseable
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    // User is authenticated, proceed with test
    // (Access control is already handled by the admin layout)

    // Get URL from request body
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Feed URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format" },
        { status: 400 }
      );
    }

    console.log(`Testing RSS feed: ${url}`);

    // Fetch and parse the feed
    const parseResult = await fetchAndParseRssFeed(url);

    if (parseResult.error) {
      console.error(`Feed test failed for ${url}:`, parseResult.error);
      return NextResponse.json({
        success: false,
        error: parseResult.error,
      });
    }

    console.log(`Feed test successful for ${url}: ${parseResult.items?.length || 0} items found`);

    // Return success with feed info
    return NextResponse.json({
      success: true,
      message: "Feed is valid and accessible",
      itemsFound: parseResult.items?.length || 0,
      feedTitle: parseResult.feedTitle,
      feedDescription: parseResult.feedDescription,
    });
  } catch (error) {
    console.error("RSS test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to test feed",
      },
      { status: 500 }
    );
  }
}
