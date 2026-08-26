import { createClient } from "@/lib/supabase/server";
import { cache } from "react";

/**
 * Get the current authenticated user (Server Components)
 * 
 * This function is cached per request to avoid multiple database calls.
 * Use this in server components, server actions, and route handlers.
 * 
 * @returns User object if authenticated, null if not
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

/**
 * Get the current session (Server Components)
 * 
 * Returns the full session object including access token.
 * 
 * @returns Session object if authenticated, null if not
 */
export const getSession = cache(async () => {
  const supabase = await createClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
});

/**
 * Require authentication (Server Components)
 * 
 * Throws an error if the user is not authenticated.
 * Use this at the top of server components/actions that require auth.
 * 
 * @throws Error if user is not authenticated
 * @returns User object
 */
export async function requireUser() {
  const user = await getUser();
  
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }

  return user;
}
