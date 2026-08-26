/**
 * Supabase Utilities
 * 
 * Import the appropriate client based on your component type:
 * 
 * - Client Components: import { createClient } from "@/lib/supabase/client"
 * - Server Components: import { createClient } from "@/lib/supabase/server"
 * - Middleware: import { updateSession } from "@/lib/supabase/middleware"
 */

export { createClient as createBrowserClient } from "./client";
export { createClient as createServerClient } from "./server";
export { updateSession } from "./middleware";
