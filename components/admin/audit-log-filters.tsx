"use client";

/**
 * Audit Log Filters Component
 * Milestone 17: Filter controls for audit log viewer
 */

import { useState, useEffect } from "react";
import type { AuditAction, ResourceType, AuditLogFilters } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { X, Calendar, Search } from "lucide-react";

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

// Quick date range presets
const getQuickDateRange = (range: string): { startDate: string; endDate: string } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDate = now.toISOString().split('T')[0];
  
  switch (range) {
    case 'today':
      return {
        startDate: today.toISOString().split('T')[0],
        endDate,
      };
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: yesterday.toISOString().split('T')[0],
        endDate: yesterday.toISOString().split('T')[0],
      };
    case 'last7days':
      const last7 = new Date(today);
      last7.setDate(last7.getDate() - 7);
      return {
        startDate: last7.toISOString().split('T')[0],
        endDate,
      };
    case 'last30days':
      const last30 = new Date(today);
      last30.setDate(last30.getDate() - 30);
      return {
        startDate: last30.toISOString().split('T')[0],
        endDate,
      };
    case 'thisMonth':
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: firstDay.toISOString().split('T')[0],
        endDate,
      };
    default:
      return { startDate: '', endDate: '' };
  }
};

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

  const handleQuickDate = (range: string) => {
    const dateRange = getQuickDateRange(range);
    const newFilters = {
      ...localFilters,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters); // Auto-apply quick filters
  };

  const hasActiveFilters = Object.keys(localFilters).some(
    key => localFilters[key as keyof AuditLogFilters] !== undefined && 
           localFilters[key as keyof AuditLogFilters] !== ''
  );

  const activeFilterCount = Object.keys(localFilters).filter(
    key => localFilters[key as keyof AuditLogFilters] !== undefined && 
           localFilters[key as keyof AuditLogFilters] !== ''
  ).length;

  return (
    <div className="space-y-4">
      {/* Quick Date Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
          <Calendar className="h-4 w-4" />
          <span>Quick Filters:</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickDate('today')}
          className="h-7 text-xs"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickDate('yesterday')}
          className="h-7 text-xs"
        >
          Yesterday
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickDate('last7days')}
          className="h-7 text-xs"
        >
          Last 7 Days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickDate('last30days')}
          className="h-7 text-xs"
        >
          Last 30 Days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickDate('thisMonth')}
          className="h-7 text-xs"
        >
          This Month
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <X className="mr-1 h-3 w-3" />
            Clear All {activeFilterCount > 0 && `(${activeFilterCount})`}
          </Button>
        )}
      </div>

      {/* Detailed Filters */}
      <div className="rounded-lg border border-border bg-background-panel p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Search className="h-4 w-4" />
            Advanced Filters
          </h3>
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
                  {user.full_name || user.email?.split('@')[0] || user.email}
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

        <div className="mt-4 flex justify-end gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleReset}
              className="h-9"
            >
              Reset
            </Button>
          )}
          <Button onClick={handleApply} className="h-9">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
