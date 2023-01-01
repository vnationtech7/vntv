import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

/**
 * Next.js Middleware for Auth Session Management and Admin Route Protection
 * 
 * This middleware:
 * 1. Refreshes the user's session if expired
 * 2. Ensures auth state is consistent across requests
 * 3. Protects admin routes - requires staff role
 * 
 * The middleware runs on every request that matches the config below.
 */
export async function middleware(request: NextRequest) {
  // Update session first
  let supabaseResponse = await updateSession(request);

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Create Supabase client
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Not authenticated - redirect to home
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // Check if user has any staff role
    // @ts-ignore
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select(
        `
        roles (
          name
        )
      `
      )
      .eq("user_id", user.id);

    const roles = userRoles?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];
    const staffRoles = ["super_admin", "editor", "reporter", "video_editor", "advertising_manager"];
    const hasStaffRole = roles.some((role) => staffRoles.includes(role));

    if (!hasStaffRole) {
      // No staff role - redirect to unauthorized
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
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
