import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js Middleware for Auth Session Management
 * 
 * This middleware:
 * 1. Refreshes the user's session if expired
 * 2. Ensures auth state is consistent across requests
 * 3. Protects routes that require authentication (optional)
 * 
 * The middleware runs on every request that matches the config below.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Middleware Configuration
 * 
 * Specify which routes should run through the middleware.
 * - Matches all routes except static files and API routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
