"use client";

/**
 * Audit Logs Client Component
 * Milestone 17: Client-side audit log management with filtering and pagination
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AuditLogWithUser, AuditLogFilters } from "@/types/audit";
import { AuditLogFilters as FiltersComponent } from "@/components/admin/audit-log-filters";
import { AuditLogTable } from "@/components/admin/audit-log-table";
import { Button } from "@/components/ui/button";
import { getAuditLogs, exportAuditLogs } from "@/app/actions/audit";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AuditLogsClientProps {
  initialLogs: AuditLogWithUser[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  users: Array<{ id: string; email: string; full_name: string | null }>;
  error: string | null;
}

export function AuditLogsClient({
  initialLogs,
  initialPagination,
  users,
  error: initialError,
}: AuditLogsClientProps) {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogWithUser[]>(initialLogs);
  const [pagination, setPagination] = useState(initialPagination);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const handleFilterChange = async (newFilters: AuditLogFilters) => {
    setFilters(newFilters);
    setLoading(true);
    setError(null);

    const result = await getAuditLogs({ filters: newFilters, page: 1, limit: 50 });

    if (result.success) {
      setLogs(result.data || []);
      setPagination(result.pagination || null);
    } else {
      setError(result.error || "Failed to fetch audit logs");
      toast.error(result.error || "Failed to fetch audit logs");
    }

    setLoading(false);
  };

  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    setError(null);

    const result = await getAuditLogs({ filters, page: newPage, limit: 50 });

    if (result.success) {
      setLogs(result.data || []);
      setPagination(result.pagination || null);
      // Update URL
      router.push(`/admin/audit-logs?page=${newPage}`);
    } else {
      setError(result.error || "Failed to fetch audit logs");
      toast.error(result.error || "Failed to fetch audit logs");
    }

    setLoading(false);
  };

  const handleExport = async () => {
    toast.loading("Exporting audit logs...");

    const result = await exportAuditLogs(filters);

    toast.dismiss();

    if (result.success && result.data) {
      // Create blob and download
      const blob = new Blob([result.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Audit logs exported successfully");
    } else {
      toast.error(result.error || "Failed to export audit logs");
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-900/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-300">
              Error Loading Audit Logs
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FiltersComponent
        filters={filters}
        onFilterChange={handleFilterChange}
        users={users}
      />

      {/* Stats */}
      {pagination && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-background-panel px-4 py-3">
          <div className="text-sm text-text-secondary">
            Showing <span className="font-semibold text-text-primary">{logs.length}</span> of{" "}
            <span className="font-semibold text-text-primary">{pagination.total}</span> logs
          </div>
          <div className="text-xs text-text-tertiary">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-lg bg-background p-6 shadow-lg">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-vntv-red border-r-transparent" />
            <p className="mt-4 text-sm text-text-secondary">Loading...</p>
          </div>
        </div>
      )}

      {/* Table */}
      <AuditLogTable logs={logs} onExport={handleExport} />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-background-panel px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                  className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
                    pagination.page === pageNum
                      ? "bg-vntv-red text-white"
                      : "text-text-secondary hover:bg-background-panel-2"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || loading}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
