import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, enabled } = body;

    if (!email || typeof enabled !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current newsletter subscription
    const { data: currentSub } = await supabase
      .from("newsletter_subscribers")
      .select("is_active, id")
      .eq("user_id", user.id)
      .maybeSingle();

    type NewsletterSub = { is_active: boolean; id: string } | null;
    const typedSub = currentSub as NewsletterSub;

    if (enabled) {
      if (!typedSub) {
        // Create new subscription (auto-verified for authenticated users)
        const crypto = await import("crypto");
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const unsubscribeToken = crypto.randomBytes(32).toString("hex");

        await supabase.from("newsletter_subscribers").insert({
          email: email as string,
          user_id: user.id,
          is_active: true,
          verification_token: verificationToken,
          unsubscribe_token: unsubscribeToken,
          verified_at: new Date().toISOString(),
          subscribed_at: new Date().toISOString(),
        } as any);
      } else if (!typedSub.is_active) {
        // Reactivate existing subscription
        const supabaseAny = supabase as any;
        await supabaseAny
          .from("newsletter_subscribers")
          .update({
            is_active: true,
            unsubscribed_at: null,
          })
          .eq("id", typedSub.id);
      }
    } else {
      if (typedSub?.is_active) {
        // Deactivate subscription
        const supabaseAny = supabase as any;
        await supabaseAny
          .from("newsletter_subscribers")
          .update({
            is_active: false,
            unsubscribed_at: new Date().toISOString(),
          })
          .eq("id", typedSub.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in sync-newsletter API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
