/**
 * Server-Side Authorization Utilities
 * 
 * Provides role-based access control for admin pages.
 * ALL admin pages MUST use these functions to verify user permissions.
 * 
 * Security: These functions run server-side only and cannot be bypassed.
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * User role types matching database enum
 */
export type UserRole = 
  | "super_admin" 
  | "editor" 
  | "reporter" 
  | "video_editor" 
  | "advertising_manager";

/**
 * Result from authorization check
 */
export interface AuthResult {
  user: {
    id: string;
    email: string | undefined;
  };
  roles: string[];
}

/**
 * Require user to be authenticated
 * Redirects to home if not logged in
 */
export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return user;
}

/**
 * Get user's roles from database
 */
async function getUserRoles(userId: string): Promise<string[]> {
  const supabase = await createClient();

  // @ts-ignore - Database schema types
  const { data, error } = await supabase
    .from("user_roles")
    .select(`
      roles (
        name
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }

  return data?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];
}

/**
 * Require user to have at least one of the specified roles
 * Redirects to /unauthorized if user lacks permission
 * 
 * @param allowedRoles - Array of roles that are allowed access
 * @returns AuthResult with user and their roles
 * 
 * @example
 * // Require editor or admin
 * await requireRole(["super_admin", "editor"]);
 * 
 * @example
 * // Require specific role
 * const { user, roles } = await requireRole(["video_editor"]);
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthResult> {
  const user = await requireAuth();
  const userRoles = await getUserRoles(user.id);

  const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasPermission) {
    redirect("/unauthorized");
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    roles: userRoles,
  };
}

/**
 * Require user to be Super Admin
 * Use for sensitive operations like user/role management
 */
export async function requireSuperAdmin(): Promise<AuthResult> {
  return requireRole(["super_admin"]);
}

/**
 * Require user to be Editor or Super Admin
 * Use for content management (articles, breaking news, homepage)
 */
export async function requireEditor(): Promise<AuthResult> {
  return requireRole(["super_admin", "editor"]);
}

/**
 * Require user to have video editing permissions
 * Use for video and media management
 */
export async function requireVideoEditor(): Promise<AuthResult> {
  return requireRole(["super_admin", "editor", "video_editor"]);
}

/**
 * Require user to have article creation permissions
 * Use for article creation/editing
 */
export async function requireArticleAccess(): Promise<AuthResult> {
  return requireRole(["super_admin", "editor", "reporter"]);
}

/**
 * Require user to have advertising permissions
 * Use for ad management
 */
export async function requireAdvertisingAccess(): Promise<AuthResult> {
  return requireRole(["super_admin", "advertising_manager"]);
}

/**
 * Require user to have ANY staff role
 * Use for general admin dashboard access
 */
export async function requireAnyStaffRole(): Promise<AuthResult> {
  return requireRole([
    "super_admin",
    "editor",
    "reporter",
    "video_editor",
    "advertising_manager",
  ]);
}

/**
 * Check if user has a specific role (without redirecting)
 * Use for conditional UI rendering or business logic
 * 
 * @returns true if user has the role, false otherwise
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  try {
    const user = await requireAuth();
    const userRoles = await getUserRoles(user.id);
    return userRoles.includes(role);
  } catch {
    return false;
  }
}

/**
 * Check if user has any of the specified roles (without redirecting)
 * 
 * @returns true if user has at least one of the roles, false otherwise
 */
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  try {
    const user = await requireAuth();
    const userRoles = await getUserRoles(user.id);
    return roles.some((role) => userRoles.includes(role));
  } catch {
    return false;
  }
}

/**
 * Get current user and their roles (without requiring specific roles)
 * Returns null if not authenticated
 */
export async function getCurrentUserWithRoles(): Promise<AuthResult | null> {
  try {
    const user = await requireAuth();
    const userRoles = await getUserRoles(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      roles: userRoles,
    };
  } catch {
    return null;
  }
}
