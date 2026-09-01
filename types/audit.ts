// Audit logging types for Milestone 17

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "archive"
  | "feature"
  | "unfeature"
  | "assign_role"
  | "remove_role"
  | "enable"
  | "disable"
  | "activate"
  | "deactivate"
  | "upload"
  | "import";

export type ResourceType =
  | "article"
  | "video"
  | "programme"
  | "episode"
  | "category"
  | "tag"
  | "author"
  | "user_role"
  | "site_settings"
  | "breaking_news"
  | "homepage_section"
  | "homepage_item"
  | "rss_feed"
  | "rss_item"
  | "media_asset"
  | "advertisement"
  | "newsletter_subscriber";

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: AuditAction;
  entity_type: ResourceType;
  entity_id: string | null;
  changes: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogWithUser extends AuditLogEntry {
  user: {
    email: string;
    full_name: string | null;
  } | null;
}

export interface AuditLogFilters {
  userId?: string;
  action?: AuditAction;
  entityType?: ResourceType;
  startDate?: string;
  endDate?: string;
  search?: string;
}
