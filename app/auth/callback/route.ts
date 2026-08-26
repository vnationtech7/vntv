import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth Callback Route Handler
 * 
 * Handles OAuth callbacks and email confirmation redirects from Supabase.
 * Exchanges the code for a session and redirects to the appropriate page.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    
    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the next URL or home
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
