"use client";

/**
 * Audit Log Filters Component
 * Milestone 17: Filter controls for audit log viewer
 */

import { useState, useEffect } from "react";
import type { AuditAction, ResourceType, AuditLogFilters } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface AuditLogFiltersProps {
  filters: AuditLogFilters;
  onFilterChange: (filters: AuditLogFilters) => void;
  users: Array<{ id: string; email: string; full_name: string | null }>;
}

const ACTIONS: AuditAction[] = [
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
  "archive",
  "feature",
  "unfeature",
  "assign_role",
  "remove_role",
  "enable",
  "disable",
  "activate",
  "deactivate",
  "upload",
  "import",
];

const RESOURCE_TYPES: ResourceType[] = [
  "article",
  "video",
  "programme",
  "episode",
  "category",
  "tag",
  "author",
  "user_role",
  "site_settings",
  "breaking_news",
  "homepage_section",
  "homepage_item",
  "rss_feed",
  "rss_item",
  "media_asset",
  "advertisement",
  "newsletter_subscriber",
];

export function AuditLogFilters({ filters, onFilterChange, users }: AuditLogFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AuditLogFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const emptyFilters: AuditLogFilters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.keys(localFilters).length > 0;

  return (
    <div className="rounded-lg border border-border bg-background-panel p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* User Filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            User
          </label>
          <select
            value={localFilters.userId || ""}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, userId: e.target.value || undefined })
            }
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name || user.email}
              </option>
            ))}
          </select>
        </div>

        {/* Action Filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            Action
          </label>
          <select
            value={localFilters.action || ""}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                action: (e.target.value as AuditAction) || undefined,
              })
            }
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
          >
            <option value="">All Actions</option>
            {ACTIONS.map((action) => (
              <option key={action} value={action}>
                {action.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Type Filter */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            Resource Type
          </label>
          <select
            value={localFilters.entityType || ""}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                entityType: (e.target.value as ResourceType) || undefined,
              })
            }
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
          >
            <option value="">All Types</option>
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace("_", " ").toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            Search Entity ID
          </label>
          <input
            type="text"
            value={localFilters.search || ""}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, search: e.target.value || undefined })
            }
            placeholder="ID or slug..."
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder-text-tertiary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            Start Date
          </label>
          <input
            type="date"
            value={localFilters.startDate || ""}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, startDate: e.target.value || undefined })
            }
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">
            End Date
          </label>
          <input
            type="date"
            value={localFilters.endDate || ""}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, endDate: e.target.value || undefined })
            }
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={handleApply} className="h-9">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
