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
    
    // Get user (optional - shares can be tracked without auth)
    const { data: { user } } = await supabase.auth.getUser();

    // Get IP address from headers
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";

    // Insert share record
    const { error: insertError } = await (supabase as any)
      .from("social_shares")
      .insert({
        content_type: contentType,
        content_id: contentId,
        platform,
        user_id: user?.id || null,
        ip_address: ip,
      });

    if (insertError) {
      console.error("Error tracking share:", insertError);
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
