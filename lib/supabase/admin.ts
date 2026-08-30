/**
 * Supabase Admin Client (Service Role)
 * 
 * This client uses the service role key which bypasses RLS.
 * Use ONLY for operations that require elevated permissions like:
 * - Creating user profiles after signup
 * - Admin operations
 * - System-level tasks
 * 
 * NEVER expose this client to the browser!
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
