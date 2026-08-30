import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createProfile } from "@/app/profile/actions";

/**
 * Auth Callback Route Handler
 * 
 * Handles OAuth callbacks and email confirmation redirects from Supabase.
 * Exchanges the code for a session and redirects to the appropriate page.
 * Also ensures a profile is created for new users.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(new URL("/auth/error", requestUrl.origin));
    }

    // Check if profile exists, create if not
    if (data.user) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingProfile) {
        // Profile doesn't exist, create it
        const email = data.user.email || "";
        await createProfile(data.user.id, email);
      }
    }
  }

  // Redirect to the next URL or home
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
