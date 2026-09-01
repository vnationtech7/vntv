import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, contentType, contentId } = body;

    if (!platform || !contentType || !contentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get user ID if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get IP address and user agent
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Insert share event
    const { error } = await supabase.from("social_shares").insert({
      content_type: contentType as "article" | "video",
      content_id: contentId,
      platform: platform,
      user_id: user?.id || null,
      ip_address: ipAddress as string,
    } as any);

    if (error) {
      console.error("Error tracking share:", error);
      return NextResponse.json(
        { error: "Failed to track share" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in track-share API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
