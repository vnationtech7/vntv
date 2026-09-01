"use client";

import { useState, useEffect } from "react";
import {
  getNewsletterSubscribers,
  getNewsletterStats,
  exportNewsletterSubscribers,
  deleteNewsletterSubscriber,
  type NewsletterSubscriber,
  type NewsletterStats,
} from "@/app/actions/newsletter-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  MailOpen,
  Loader2,
  Users,
  UserCheck,
  UserX,
  MailQuestion,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type FilterType = "all" | "active" | "inactive" | "verified" | "unverified";

export function NewsletterSubscribersList() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const limit = 50;
  const totalPages = Math.ceil(totalCount / limit);

  useEffect(() => {
    loadSubscribers();
    loadStats();
  }, [page, filter, search]);

  async function loadSubscribers() {
    setLoading(true);
    const result = await getNewsletterSubscribers({
      page,
      limit,
      search,
      filter,
    });

    if (result.success) {
      setSubscribers(result.data);
      setTotalCount(result.count);
    }
    setLoading(false);
  }

  async function loadStats() {
    const result = await getNewsletterStats();
    if (result.success && result.stats) {
      setStats(result.stats);
    }
  }

  async function handleExport() {
    setExporting(true);
    const result = await exportNewsletterSubscribers(filter);

    if (result.success && result.csv) {
      // Create and download CSV file
      const blob = new Blob([result.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
    setExporting(false);
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Are you sure you want to delete subscriber: ${email}?`)) {
      return;
    }

    setDeletingId(id);
    const result = await deleteNewsletterSubscriber(id);

    if (result.success) {
      loadSubscribers();
      loadStats();
    } else {
      alert(result.error || "Failed to delete subscriber");
    }
    setDeletingId(null);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1); // Reset to first page on search
  }

  function handleFilterChange(newFilter: FilterType) {
    setFilter(newFilter);
    setPage(1); // Reset to first page on filter change
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={Users}
            label="Total"
            value={stats.total}
            color="text-blue-500"
          />
          <StatCard
            icon={UserCheck}
            label="Active"
            value={stats.active}
            color="text-green-500"
          />
          <StatCard
            icon={MailOpen}
            label="Verified"
            value={stats.verified}
            color="text-purple-500"
          />
          <StatCard
            icon={MailQuestion}
            label="Unverified"
            value={stats.unverified}
            color="text-yellow-500"
          />
          <StatCard
            icon={UserX}
            label="Unsubscribed"
            value={stats.unsubscribed}
            color="text-red-500"
          />
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={filter === "all"}
            onClick={() => handleFilterChange("all")}
            label="All"
          />
          <FilterButton
            active={filter === "active"}
            onClick={() => handleFilterChange("active")}
            label="Active"
          />
          <FilterButton
            active={filter === "inactive"}
            onClick={() => handleFilterChange("inactive")}
            label="Inactive"
          />
          <FilterButton
            active={filter === "verified"}
            onClick={() => handleFilterChange("verified")}
            label="Verified"
          />
          <FilterButton
            active={filter === "unverified"}
            onClick={() => handleFilterChange("unverified")}
            label="Unverified"
          />
        </div>

        <Button
          onClick={handleExport}
          disabled={exporting || totalCount === 0}
          variant="outline"
          size="sm"
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </>
          )}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <Input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Subscribers Table */}
      <div className="bg-background-panel border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-panel-2 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Subscribed
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-text-tertiary" />
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                    No subscribers found
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-background-panel-2">
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {subscriber.email}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {subscriber.is_active ? (
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                          <XCircle className="h-4 w-4" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {subscriber.verified_at ? (
                        <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <MailOpen className="h-4 w-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                          <Mail className="h-4 w-4" />
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {formatDistanceToNow(new Date(subscriber.subscribed_at), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subscriber.id, subscriber.email)}
                        disabled={deletingId === subscriber.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        {deletingId === subscriber.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of{" "}
              {totalCount} subscribers
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-background-panel border border-border rounded-lg p-4">
      <div className="flex items-center gap-3">
        <Icon className={`h-8 w-8 ${color}`} />
        <div>
          <div className="text-2xl font-bold text-text-primary">{value.toLocaleString()}</div>
          <div className="text-xs text-text-secondary uppercase tracking-wide">{label}</div>
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <Button
      variant={active ? "primary" : "outline"}
      size="sm"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
