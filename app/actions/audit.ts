// @ts-nocheck
"use server";

/**
 * Audit Logging Actions
 * Milestone 17: Audit Logging & Security Hardening
 * 
 * Provides comprehensive audit trail for all critical CMS actions
 */

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import type { AuditAction, ResourceType, AuditLogFilters, AuditLogWithUser } from "@/types/audit";

/**
 * Log an audit event
 * Records user actions for security and compliance
 */
export async function logAuditEvent(params: {
  action: AuditAction;
  entityType: ResourceType;
  entityId?: string | null;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn("Audit log attempted without authenticated user");
      return { success: false, error: "Not authenticated" };
    }

    // Get IP address and user agent
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() 
      || headersList.get("x-real-ip") 
      || null;
    const userAgent = headersList.get("user-agent") || null;

    // Build changes object
    const changes: Record<string, any> = {};
    if (params.oldValues) changes.old = params.oldValues;
    if (params.newValues) changes.new = params.newValues;

    // Insert audit log
    const { error } = await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      changes: Object.keys(changes).length > 0 ? changes : null,
      ip_address: ip,
      user_agent: userAgent,
    } as any);

    if (error) {
      console.error("Failed to log audit event:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in logAuditEvent:", error);
    return { success: false, error: "Failed to log audit event" };
  }
}

/**
 * Get audit logs with filtering and pagination
 */
export async function getAuditLogs(params: {
  filters?: AuditLogFilters;
  page?: number;
  limit?: number;
}) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id);

    const isAdmin = roles?.some(r => r.role_id === "super_admin");
    if (!isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const page = params.page || 1;
    const limit = params.limit || 50;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("audit_logs")
      .select(`
        *,
        user:profiles!audit_logs_user_id_fkey(
          email,
          full_name
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply filters
    if (params.filters?.userId) {
      query = query.eq("user_id", params.filters.userId);
    }
    if (params.filters?.action) {
      query = query.eq("action", params.filters.action);
    }
    if (params.filters?.entityType) {
      query = query.eq("entity_type", params.filters.entityType);
    }
    if (params.filters?.startDate) {
      query = query.gte("created_at", params.filters.startDate);
    }
    if (params.filters?.endDate) {
      query = query.lte("created_at", params.filters.endDate);
    }
    if (params.filters?.search) {
      // Search in entity_id (for slugs, IDs, etc.)
      query = query.or(`entity_id.ilike.%${params.filters.search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching audit logs:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data as AuditLogWithUser[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  } catch (error) {
    console.error("Error in getAuditLogs:", error);
    return { success: false, error: "Failed to fetch audit logs" };
  }
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditHistory(
  entityType: ResourceType,
  entityId: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        *,
        user:profiles!audit_logs_user_id_fkey(
          email,
          full_name
        )
      `)
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching entity audit history:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data as AuditLogWithUser[],
    };
  } catch (error) {
    console.error("Error in getEntityAuditHistory:", error);
    return { success: false, error: "Failed to fetch entity history" };
  }
}

/**
 * Get users who have performed actions (for filter dropdown)
 */
export async function getAuditUsers() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id);

    const isAdmin = roles?.some(r => r.role_id === "super_admin");
    if (!isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        user_id,
        user:profiles!audit_logs_user_id_fkey(
          email,
          full_name
        )
      `)
      .not("user_id", "is", null);

    if (error) {
      console.error("Error fetching audit users:", error);
      return { success: false, error: error.message };
    }

    // Deduplicate users
    const uniqueUsers = Array.from(
      new Map(
        data.map(item => [
          item.user_id,
          {
            id: item.user_id,
            email: item.user?.email || "Unknown",
            full_name: item.user?.full_name,
          },
        ])
      ).values()
    );

    return {
      success: true,
      data: uniqueUsers,
    };
  } catch (error) {
    console.error("Error in getAuditUsers:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

/**
 * Export audit logs to CSV
 */
export async function exportAuditLogs(filters?: AuditLogFilters) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id);

    const isAdmin = roles?.some(r => r.role_id === "super_admin");
    if (!isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    // Build query (limit to 10,000 rows for safety)
    let query = supabase
      .from("audit_logs")
      .select(`
        *,
        user:profiles!audit_logs_user_id_fkey(
          email,
          full_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(10000);

    // Apply filters
    if (filters?.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters?.action) {
      query = query.eq("action", filters.action);
    }
    if (filters?.entityType) {
      query = query.eq("entity_type", filters.entityType);
    }
    if (filters?.startDate) {
      query = query.gte("created_at", filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte("created_at", filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error exporting audit logs:", error);
      return { success: false, error: error.message };
    }

    // Convert to CSV
    const csv = convertToCSV(data as AuditLogWithUser[]);

    return {
      success: true,
      data: csv,
    };
  } catch (error) {
    console.error("Error in exportAuditLogs:", error);
    return { success: false, error: "Failed to export audit logs" };
  }
}

/**
 * Helper: Convert audit logs to CSV format
 */
function convertToCSV(logs: AuditLogWithUser[]): string {
  const headers = [
    "Timestamp",
    "User Email",
    "User Name",
    "Action",
    "Resource Type",
    "Resource ID",
    "IP Address",
    "Changes",
  ];

  const rows = logs.map(log => [
    log.created_at,
    log.user?.email || "N/A",
    log.user?.full_name || "N/A",
    log.action,
    log.entity_type,
    log.entity_id || "N/A",
    log.ip_address || "N/A",
    log.changes ? JSON.stringify(log.changes) : "N/A",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return csvContent;
}
