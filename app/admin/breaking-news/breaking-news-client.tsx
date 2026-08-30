"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BreakingNews,
  deleteBreakingNews,
  toggleBreakingNewsStatus,
} from "@/app/actions/breaking-news";
import {
  Edit,
  Trash2,
  Power,
  PowerOff,
  Calendar,
  ExternalLink,
  AlertCircle,
  Plus,
} from "lucide-react";
import Link from "next/link";

interface BreakingNewsClientProps {
  initialNews: BreakingNews[];
}

export default function BreakingNewsClient({
  initialNews,
}: BreakingNewsClientProps) {
  const router = useRouter();
  const [news, setNews] = useState(initialNews);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async (id: string, headline: string) => {
    const confirmed = confirm(
      `Delete breaking news: "${headline}"?\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const result = await deleteBreakingNews(id);
      if (result.success) {
        setNews((prev) => prev.filter((item) => item.id !== id));
        alert("Breaking news deleted successfully");
      } else {
        alert(`Failed to delete: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting breaking news:", error);
      alert("Failed to delete breaking news");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setIsProcessing(true);
    try {
      const result = await toggleBreakingNewsStatus(id, !currentStatus);
      if (result.data) {
        setNews((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, is_active: !currentStatus } : item
          )
        );
      } else {
        alert(`Failed to toggle status: ${result.error}`);
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Failed to toggle status");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isScheduled = (startsAt: string) => {
    return new Date(startsAt) > new Date();
  };

  const getStatusBadge = (item: BreakingNews) => {
    if (!item.is_active) {
      return (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
          Inactive
        </span>
      );
    }
    if (isScheduled(item.starts_at)) {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          Scheduled
        </span>
      );
    }
    if (isExpired(item.expires_at)) {
      return (
        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
          Expired
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse" />
        Live
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{news.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Live Now</p>
          <p className="text-2xl font-bold text-green-600">
            {
              news.filter(
                (item) =>
                  item.is_active &&
                  !isScheduled(item.starts_at) &&
                  !isExpired(item.expires_at)
              ).length
            }
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600">
            {
              news.filter((item) => item.is_active && isScheduled(item.starts_at))
                .length
            }
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Inactive</p>
          <p className="text-2xl font-bold text-gray-600">
            {news.filter((item) => !item.is_active).length}
          </p>
        </div>
      </div>

      {/* Breaking News List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {news.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No breaking news created yet</p>
            <Link
              href="/admin/breaking-news/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Breaking News
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Headline
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 mb-1">
                          {item.headline_override}
                        </p>
                        {item.article && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Linked to: {item.article.title}
                          </p>
                        )}
                        {item.link_url && !item.article && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {item.link_url}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-full font-bold text-sm">
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Start: {formatDate(item.starts_at)}
                        </p>
                        {item.expires_at && (
                          <p className="text-gray-600 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            End: {formatDate(item.expires_at)}
                          </p>
                        )}
                        {!item.expires_at && (
                          <p className="text-gray-400 text-xs mt-1">
                            No expiration
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleToggleStatus(item.id, item.is_active)
                          }
                          disabled={isProcessing}
                          className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                            item.is_active
                              ? "text-green-600 hover:bg-green-50"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                          title={item.is_active ? "Deactivate" : "Activate"}
                        >
                          {item.is_active ? (
                            <Power className="w-4 h-4" />
                          ) : (
                            <PowerOff className="w-4 h-4" />
                          )}
                        </button>
                        <Link
                          href={`/admin/breaking-news/${item.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.headline_override)}
                          disabled={isProcessing}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
