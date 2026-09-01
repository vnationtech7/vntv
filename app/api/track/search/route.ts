import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const { query, resultsCount = 0 } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser();

    // Get IP address
    const ip = request.headers.get("x-forwarded-for") || 
                request.headers.get("x-real-ip") || 
                "unknown";

    // Insert search query tracking
    const { error } = await supabase
      .from("search_queries")
      .insert({
        query: query.trim(),
        results_count: resultsCount,
        user_id: user?.id || null,
        ip_address: ip as string,
      } as any);

    if (error) {
      console.error("Error tracking search:", error);
      return NextResponse.json(
        { error: "Failed to track search" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in search tracking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
