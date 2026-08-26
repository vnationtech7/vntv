"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useAuth } from "./auth-provider";

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * If true, redirects to home if user IS authenticated
   * (for login/signup pages)
   */
  requireGuest?: boolean;
  /**
   * Redirect path after authentication
   */
  redirectTo?: string;
}

/**
 * Protected Route Component
 * 
 * Protects client-side routes by checking authentication status.
 * 
 * Default behavior: Requires authentication, opens login modal if not authenticated
 * With requireGuest: Redirects to home if already authenticated
 * 
 * Usage:
 * ```tsx
 * <ProtectedRoute>
 *   <ProfilePage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  requireGuest = false,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, loading } = useUser();
  const { openLogin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (requireGuest && user) {
      // Guest-only route, but user is authenticated
      router.push(redirectTo || "/");
    } else if (!requireGuest && !user) {
      // Protected route, but user is not authenticated
      openLogin();
    }
  }, [user, loading, requireGuest, redirectTo, router, openLogin]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[--color-vntv-red]"></div>
      </div>
    );
  }

  // For guest-only routes, don't render if authenticated
  if (requireGuest && user) {
    return null;
  }

  // For protected routes, don't render if not authenticated
  if (!requireGuest && !user) {
    return null;
  }

  return <>{children}</>;
}
