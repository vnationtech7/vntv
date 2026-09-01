// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/permissions";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  user_id: string | null;
  is_active: boolean;
  verified_at: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  preferences: any;
}

export interface NewsletterStats {
  total: number;
  active: number;
  verified: number;
  unverified: number;
  unsubscribed: number;
}

/**
 * Get newsletter subscribers with pagination and filtering
 */
export async function getNewsletterSubscribers(options: {
  page?: number;
  limit?: number;
  search?: string;
  filter?: "all" | "active" | "inactive" | "verified" | "unverified";
} = {}) {
  const supabase = await createClient();

  // Check permissions
  const canManage = await hasPermission("manage_newsletter");
  if (!canManage) {
    return { success: false, error: "Unauthorized", data: [], count: 0 };
  }

  const page = options.page || 1;
  const limit = options.limit || 50;
  const offset = (page - 1) * limit;
  const search = options.search?.toLowerCase().trim() || "";
  const filter = options.filter || "all";

  try {
    let query = supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact" })
      .order("subscribed_at", { ascending: false });

    // Apply search
    if (search) {
      query = query.ilike("email", `%${search}%`);
    }

    // Apply filters
    if (filter === "active") {
      query = query.eq("is_active", true);
    } else if (filter === "inactive") {
      query = query.eq("is_active", false);
    } else if (filter === "verified") {
      query = query.not("verified_at", "is", null);
    } else if (filter === "unverified") {
      query = query.is("verified_at", null);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching subscribers:", error);
      return { success: false, error: "Failed to fetch subscribers", data: [], count: 0 };
    }

    return { success: true, data: data || [], count: count || 0 };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred", data: [], count: 0 };
  }
}

/**
 * Get newsletter statistics
 */
export async function getNewsletterStats(): Promise<{
  success: boolean;
  stats?: NewsletterStats;
  error?: string;
}> {
  const supabase = await createClient();

  // Check permissions
  const canManage = await hasPermission("manage_newsletter");
  if (!canManage) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Get total count
    const { count: total } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true });

    // Get active count
    const { count: active } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Get verified count
    const { count: verified } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .not("verified_at", "is", null);

    // Get unverified count
    const { count: unverified } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .is("verified_at", null);

    // Get unsubscribed count
    const { count: unsubscribed } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", false);

    return {
      success: true,
      stats: {
        total: total || 0,
        active: active || 0,
        verified: verified || 0,
        unverified: unverified || 0,
        unsubscribed: unsubscribed || 0,
      },
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Export subscribers to CSV format
 */
export async function exportNewsletterSubscribers(filter?: string) {
  const supabase = await createClient();

  // Check permissions
  const canManage = await hasPermission("manage_newsletter");
  if (!canManage) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    let query = supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });

    // Apply filter if provided
    if (filter === "active") {
      query = query.eq("is_active", true);
    } else if (filter === "verified") {
      query = query.not("verified_at", "is", null);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error exporting subscribers:", error);
      return { success: false, error: "Failed to export subscribers" };
    }

    // Convert to CSV
    const headers = ["Email", "Status", "Verified", "Subscribed Date", "Unsubscribed Date"];
    const rows = (data || []).map((sub: any) => [
      sub.email,
      sub.is_active ? "Active" : "Unsubscribed",
      sub.verified_at ? "Yes" : "No",
      new Date(sub.subscribed_at).toLocaleDateString(),
      sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleDateString() : "-",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    return { success: true, csv };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a subscriber (admin action)
 */
export async function deleteNewsletterSubscriber(id: string) {
  const supabase = await createClient();

  // Check permissions
  const canManage = await hasPermission("manage_newsletter");
  if (!canManage) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting subscriber:", error);
      return { success: false, error: "Failed to delete subscriber" };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
