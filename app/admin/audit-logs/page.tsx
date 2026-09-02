/**
 * Audit Logs Page
 * Milestone 17: View and filter all audit log events
 */

import { Suspense } from "react";
import { PageHeader } from "@/components/cms/page-header";
import { AuditLogsClient } from "./audit-logs-client";
import { getAuditLogs, getAuditUsers } from "@/app/actions/audit";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Audit Logs | VNTV Admin",
  description: "View security audit trail and system activity logs",
};

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  // Fetch initial data
  const [logsResult, usersResult] = await Promise.all([
    getAuditLogs({ page, limit: 50 }),
    getAuditUsers(),
  ]);

  const logs = logsResult.success ? (logsResult.data || []) : [];
  const pagination = logsResult.success ? logsResult.pagination : null;
  const users = usersResult.success ? ((usersResult.data || []) as Array<{ id: string; email: string; full_name: string | null }>) : [];
  const error = !logsResult.success ? logsResult.error : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Security audit trail and system activity monitoring"
      />

      <Suspense
        fallback={
          <div className="rounded-lg border border-border bg-background-panel p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-vntv-red border-r-transparent" />
            <p className="mt-4 text-sm text-text-secondary">Loading audit logs...</p>
          </div>
        }
      >
        <AuditLogsClient
          initialLogs={logs || []}
          initialPagination={pagination}
          users={users || []}
          error={error}
        />
      </Suspense>
    </div>
  );
}
