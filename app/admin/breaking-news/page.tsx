"use client";

import { useState, useEffect, useTransition } from "react";
import { PageHeader, DataTable } from "@/components/cms";
import { Plus, Flame, Trash2 } from "lucide-react";
import {
  getBreakingNewsAdmin,
  deleteBreakingNews,
  toggleBreakingNewsActive,
} from "../homepage/actions";

interface BreakingNewsItem {
  id: string;
  title: string;
  article_id: string;
  is_active: boolean;
  priority: number;
  starts_at: string;
  expires_at: string | null;
  article: { id: string; title: string; slug: string } | null;
}

export default function BreakingNewsPage() {
  const [items, setItems] = useState<BreakingNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await getBreakingNewsAdmin();
    if (result.data) {
      setItems(result.data as BreakingNewsItem[]);
    }
    setLoading(false);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleBreakingNewsActive(id, !currentStatus);
      if (result.success) {
        await loadData();
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this breaking news item?")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteBreakingNews(id);
      if (result.success) {
        await loadData();
      }
    });
  };

  const columns = [
    {
      header: "Status",
      accessor: "is_active" as const,
      render: (item: BreakingNewsItem) => (
        <button
          onClick={() => handleToggleActive(item.id, item.is_active)}
          disabled={isPending}
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
            item.is_active
              ? "bg-vntv-red text-white"
              : "bg-surface-tertiary text-text-tertiary hover:bg-surface-secondary"
          }`}
        >
          <Flame className="w-3.5 h-3.5" fill={item.is_active ? "currentColor" : "none"} />
          {item.is_active ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      header: "Title",
      accessor: "title" as const,
      render: (item: BreakingNewsItem) => (
        <div>
          <div className="font-semibold">{item.title}</div>
          {item.article && (
            <div className="text-xs text-text-tertiary mt-1">
              Article: {item.article.title}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Priority",
      accessor: "priority" as const,
      render: (item: BreakingNewsItem) => (
        <span className="font-mono text-sm">{item.priority}</span>
      ),
    },
    {
      header: "Starts",
      accessor: "starts_at" as const,
      render: (item: BreakingNewsItem) => (
        <span className="text-sm">
          {new Date(item.starts_at).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Expires",
      accessor: "expires_at" as const,
      render: (item: BreakingNewsItem) => (
        <span className="text-sm">
          {item.expires_at
            ? new Date(item.expires_at).toLocaleString()
            : "Never"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "id" as const,
      render: (item: BreakingNewsItem) => (
        <button
          onClick={() => handleDelete(item.id)}
          disabled={isPending}
          className="p-2 text-vntv-red hover:bg-surface-tertiary rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Breaking News"
        description="Manage breaking news ticker items"
      >
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 bg-vntv-red/50 text-white rounded-md cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Add Breaking News
        </button>
      </PageHeader>

      {loading ? (
        <div className="text-center py-12 text-text-tertiary">Loading...</div>
      ) : (
        <DataTable columns={columns} data={items} />
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-12 bg-surface-secondary rounded-lg border border-border-primary">
          <Flame className="w-12 h-12 mx-auto mb-4 text-text-tertiary" />
          <h3 className="text-lg font-semibold mb-2">No breaking news items</h3>
          <p className="text-sm text-text-tertiary mb-4">
            Create breaking news items to display in the homepage ticker.
          </p>
        </div>
      )}
    </div>
  );
}
