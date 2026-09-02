// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface RoleData {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface UserRoleData {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
}

/**
 * Get all roles
 */
export async function getRoles() {
  const supabase = await createClient();

  // @ts-ignore - Database schema will be set up in Milestone 1
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching roles:", error);
    return { error: error.message, data: null };
  }

  return { data: data as RoleData[], error: null };
}

/**
 * Create a new role
 */
export async function createRole(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  // @ts-ignore - Database schema will be set up in Milestone 1
  const { data, error } = await supabase
    .from("roles")
    // @ts-ignore
    .insert([{
      name,
      description: description || null,
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating role:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/admin/roles");
  return { data: data as RoleData, error: null };
}

/**
 * Update a role
 */
export async function updateRole(roleId: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  // @ts-ignore - Database schema will be set up in Milestone 1
  const { data, error } = await supabase
    .from("roles")
    // @ts-ignore
    .update({
      name,
      description: description || null,
    })
    .eq("id", roleId)
    .select()
    .single();

  if (error) {
    console.error("Error updating role:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/admin/roles");
  return { data: data as RoleData, error: null };
}

/**
 * Delete a role
 */
export async function deleteRole(roleId: string) {
  const supabase = await createClient();

  // @ts-ignore - Database schema will be set up in Milestone 1
  const { error } = await supabase
    .from("roles")
    .delete()
    .eq("id", roleId);

  if (error) {
    console.error("Error deleting role:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/roles");
  return { error: null };
}

/**
 * Get user roles for a specific user
 */
export async function getUserRoles(userId: string) {
  const supabase = await createClient();

  // @ts-ignore - Database schema will be set up in Milestone 1
  const { data, error } = await supabase
    .from("user_roles")
    .select(`
      id,
      user_id,
      role_id,
      created_at,
      roles (
        id,
        name,
        description
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user roles:", error);
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

/**
 * Assign a role to a user
 */
export async function assignRole(userId: string, roleId: string) {
  const supabase = await createClient();

  // Check if role already assigned
  // @ts-ignore - Database schema will be set up in Milestone 1
  const { data: existing } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role_id", roleId)
    .single();

  if (existing) {
    return { error: "Role already assigned to this user", data: null };
  }

  // @ts-ignore - Database schema will be set up in Milestone 1
  const { data, error } = await supabase
    .from("user_roles")
    // @ts-ignore
    .insert([{
      user_id: userId,
      role_id: roleId,
    }])
    .select()
    .single();

  if (error) {
    console.error("Error assigning role:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { data: data as UserRoleData, error: null };
}

/**
 * Remove a role from a user
 */
export async function removeRole(userRoleId: string) {
  const supabase = await createClient();

  // @ts-ignore - Database schema will be set up in Milestone 1
  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("id", userRoleId);

  if (error) {
    console.error("Error removing role:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { error: null };
}

/**
 * Get all users with their profiles and roles
 */
export async function getUsers() {
  const supabase = await createClient();

  // @ts-ignore - Database schema will be set up in Milestone 1
  const { data: profiles, error }: { data: any[] | null; error: any } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      avatar_url,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return { error: error.message, data: null };
  }

  // Fetch user roles separately to avoid ambiguity
  if (profiles && profiles.length > 0) {
    const userIds = profiles.map(p => p.id);
    
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select(`
        id,
        user_id,
        role_id,
        roles (
          id,
          name
        )
      `)
      .in("user_id", userIds);

    // Attach roles to each profile
    profiles.forEach(profile => {
      profile.user_roles = userRoles?.filter(ur => ur.user_id === profile.id) || [];
    });
  }

  return { data: profiles, error: null };
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(roleName: string): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // @ts-ignore - Database schema will be set up in Milestone 1
  const { data } = await supabase
    .from("user_roles")
    .select(`
      roles (
        name
      )
    `)
    .eq("user_id", user.id);

  if (!data || data.length === 0) return false;

  return data.some((ur: any) => ur.roles?.name === roleName);
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}
