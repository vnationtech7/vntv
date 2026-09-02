"use client";

/**
 * Audit Log Table Component
 * Milestone 17: Display audit logs with expandable details
 */

import React, { useState } from "react";
import type { AuditLogWithUser } from "@/types/audit";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuditLogTableProps {
  logs: AuditLogWithUser[];
  onExport: () => void;
}

export function AuditLogTable({ logs, onExport }: AuditLogTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "update":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "publish":
      case "activate":
      case "enable":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "unpublish":
      case "deactivate":
      case "disable":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "archive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    }
  };

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-background-panel p-12 text-center">
        <p className="text-sm text-text-secondary">No audit logs found</p>
        <p className="mt-1 text-xs text-text-tertiary">
          Try adjusting your filters or date range
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="h-9"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-panel-2 text-xs font-semibold uppercase text-text-secondary">
              <tr>
                <th className="w-8 px-4 py-3"></th>
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Resource</th>
                <th className="px-4 py-3 text-left">Entity ID</th>
                <th className="px-4 py-3 text-left">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {logs.map((log) => {
                const isExpanded = expandedRows.has(log.id);
                const hasChanges = log.changes && Object.keys(log.changes).length > 0;

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      className="transition-colors hover:bg-background-panel"
                    >
                      <td className="px-4 py-3">
                        {hasChanges && (
                          <button
                            onClick={() => toggleRow(log.id)}
                            className="text-text-secondary hover:text-text-primary"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-text-primary">
                          {log.user?.full_name || log.user?.email?.split('@')[0] || "Unknown"}
                        </div>
                        <div className="text-xs text-text-tertiary">
                          {log.user?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        {log.entity_type.replace("_", " ").toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-text-secondary">
                        {log.entity_id ? (
                          log.entity_id.length > 20 ? (
                            <span title={log.entity_id}>
                              {log.entity_id.substring(0, 20)}...
                            </span>
                          ) : (
                            log.entity_id
                          )
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-text-tertiary">
                        {log.ip_address || "—"}
                      </td>
                    </tr>

                    {/* Expanded Row - Changes Detail */}
                    {isExpanded && hasChanges && (
                      <tr className="bg-background-panel">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-text-primary">
                              Changes
                            </h4>
                            <div className="grid gap-4 md:grid-cols-2">
                              {/* Old Values */}
                              {log.changes?.old && (
                                <div>
                                  <div className="mb-2 text-xs font-medium text-text-secondary">
                                    Old Values
                                  </div>
                                  <pre className="rounded border border-border bg-background p-3 text-xs text-text-primary overflow-x-auto">
                                    {JSON.stringify(log.changes.old, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* New Values */}
                              {log.changes?.new && (
                                <div>
                                  <div className="mb-2 text-xs font-medium text-text-secondary">
                                    New Values
                                  </div>
                                  <pre className="rounded border border-border bg-background p-3 text-xs text-text-primary overflow-x-auto">
                                    {JSON.stringify(log.changes.new, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>

                            {/* User Agent */}
                            {log.user_agent && (
                              <div>
                                <div className="mb-1 text-xs font-medium text-text-secondary">
                                  User Agent
                                </div>
                                <p className="text-xs text-text-tertiary">
                                  {log.user_agent}
                                </p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
