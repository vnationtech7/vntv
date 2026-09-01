"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Permission types for role-based access control
 */
export type Permission = 
  | "manage_newsletter"
  | "manage_content"
  | "manage_users"
  | "manage_advertising"
  | "manage_videos"
  | "manage_settings";

/**
 * Mapping of permissions to roles that have them
 */
const PERMISSION_ROLE_MAP: Record<Permission, string[]> = {
  manage_newsletter: ["super_admin", "editor"],
  manage_content: ["super_admin", "editor", "reporter"],
  manage_users: ["super_admin"],
  manage_advertising: ["super_admin", "advertising_manager"],
  manage_videos: ["super_admin", "editor", "video_editor"],
  manage_settings: ["super_admin"],
};

/**
 * Get user's roles from database
 */
async function getUserRoles(userId: string): Promise<string[]> {
  const supabase = await createClient();

  try {
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
  } catch (err) {
    console.error("Error in getUserRoles:", err);
    return [];
  }
}

/**
 * Check if the current user has a specific permission
 * 
 * @param permission - The permission to check
 * @returns true if user has permission, false otherwise
 * 
 * @example
 * const canManage = await hasPermission("manage_newsletter");
 * if (!canManage) {
 *   return { error: "Unauthorized" };
 * }
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return false;
    }

    // Get user's roles
    const userRoles = await getUserRoles(user.id);

    // Check if any of the user's roles grant this permission
    const allowedRoles = PERMISSION_ROLE_MAP[permission] || [];
    return userRoles.some((role) => allowedRoles.includes(role));
  } catch (err) {
    console.error("Error checking permission:", err);
    return false;
  }
}

/**
 * Check if user has any of the specified permissions
 */
export async function hasAnyPermission(permissions: Permission[]): Promise<boolean> {
  for (const permission of permissions) {
    const has = await hasPermission(permission);
    if (has) return true;
  }
  return false;
}

/**
 * Check if user has all of the specified permissions
 */
export async function hasAllPermissions(permissions: Permission[]): Promise<boolean> {
  for (const permission of permissions) {
    const has = await hasPermission(permission);
    if (!has) return false;
  }
  return true;
}

/**
 * Get all permissions for the current user
 */
export async function getUserPermissions(): Promise<Permission[]> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return [];
    }

    const userRoles = await getUserRoles(user.id);
    const permissions = new Set<Permission>();

    // Add all permissions granted by user's roles
    for (const [permission, allowedRoles] of Object.entries(PERMISSION_ROLE_MAP)) {
      if (userRoles.some((role) => allowedRoles.includes(role))) {
        permissions.add(permission as Permission);
      }
    }

    return Array.from(permissions);
  } catch (err) {
    console.error("Error getting user permissions:", err);
    return [];
  }
}
