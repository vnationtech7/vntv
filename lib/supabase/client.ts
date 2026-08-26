import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for use in Client Components
 * Uses the new publishable key format (sb_publishable_xxx)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
