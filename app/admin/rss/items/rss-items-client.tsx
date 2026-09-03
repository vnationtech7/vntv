"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  RssItem, 
  RssFeed, 
  updateRssItemStatus, 
  updateRssItemTitle,
  deleteRssItem,
  bulkDeleteRssItems
} from "@/app/actions/rss";
import {
  CheckCircle,
  XCircle,
  Eye,
  ExternalLink,
  Filter,
  RefreshCw,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Edit2,
  Save,
  X,
  Clock,
  Calendar,
  CalendarDays,
} from "lucide-react";
import RssItemPreviewModal from "./rss-item-preview-modal";

interface RssItemsClientProps {
  initialItems: RssItem[];
  feeds: RssFeed[];
  initialStatus?: string;
  initialFeedId?: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  sortBy: string;
  sortOrder: string;
}

export default function RssItemsClient({
  initialItems,
  feeds,
  initialStatus,
  initialFeedId,
  currentPage,
  totalPages,
  totalCount,
  sortBy: initialSortBy,
  sortOrder: initialSortOrder,
}: RssItemsClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selectedItem, setSelectedItem] = useState<RssItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState(initialStatus || "");
  const [feedFilter, setFeedFilter] = useState(initialFeedId || "");
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  // Inline editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

  // Sync items when initialItems changes (after filtering/pagination)
  useEffect(() => {
    setItems(initialItems);
    setSelectedItems(new Set()); // Clear selections on new data
  }, [initialItems]);

  const handleStatusChange = async (itemId: string, newStatus: "approved" | "rejected" | "pending") => {
    setIsProcessing(true);
    try {
      const result = await updateRssItemStatus(itemId, newStatus);
      if (result.data) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, status: newStatus } : item
          )
        );
        
        if (newStatus === "approved") {
          alert("RSS item approved! It will appear on the homepage.");
          router.refresh();
        }
      }
    } catch (error) {
      console.error("Error updating item status:", error);
      alert("Failed to update item status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedItems.size === 0) return;
    
    const confirmed = confirm(
      `Approve ${selectedItems.size} RSS item(s)? They will appear on the homepage.`
    );
    if (!confirmed) return;
    
    setIsProcessing(true);
    try {
      for (const itemId of selectedItems) {
        await updateRssItemStatus(itemId, "approved");
      }
      setItems((prev) =>
        prev.map((item) =>
          selectedItems.has(item.id) ? { ...item, status: "approved" } : item
        )
      );
      setSelectedItems(new Set());
      alert(`Successfully approved ${selectedItems.size} items!`);
      router.refresh();
    } catch (error) {
      console.error("Error bulk approving items:", error);
      alert("Failed to approve items");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedItems.size === 0) return;
    
    setIsProcessing(true);
    try {
      for (const itemId of selectedItems) {
        await updateRssItemStatus(itemId, "rejected");
      }
      setItems((prev) =>
        prev.map((item) =>
          selectedItems.has(item.id) ? { ...item, status: "rejected" } : item
        )
      );
      setSelectedItems(new Set());
    } catch (error) {
      console.error("Error bulk rejecting items:", error);
      alert("Failed to reject items");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    const confirmed = confirm("Delete this RSS item? This cannot be undone.");
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const result = await deleteRssItem(itemId);
      if (result.success) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        alert("Item deleted successfully");
      } else {
        alert(`Failed to delete: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    const confirmed = confirm(
      `Delete ${selectedItems.size} RSS item(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const result = await bulkDeleteRssItems(Array.from(selectedItems));
      if (result.success) {
        setItems((prev) => prev.filter((item) => !selectedItems.has(item.id)));
        setSelectedItems(new Set());
        alert(`Successfully deleted ${selectedItems.size} items`);
      } else {
        alert(`Failed to delete: ${result.error}`);
      }
    } catch (error) {
      console.error("Error bulk deleting items:", error);
      alert("Failed to delete items");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisapprove = async (itemId: string) => {
    await handleStatusChange(itemId, "pending");
  };

  const handleBulkDisapprove = async () => {
    if (selectedItems.size === 0) return;

    const confirmed = confirm(
      `Change ${selectedItems.size} item(s) back to pending status?`
    );
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      for (const itemId of selectedItems) {
        await updateRssItemStatus(itemId, "pending");
      }
      setItems((prev) =>
        prev.map((item) =>
          selectedItems.has(item.id) ? { ...item, status: "pending" } : item
        )
      );
      setSelectedItems(new Set());
      alert("Items changed to pending status");
      router.refresh();
    } catch (error) {
      console.error("Error bulk disapproving items:", error);
      alert("Failed to change status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePreview = (item: RssItem) => {
    setSelectedItem(item);
    setShowPreview(true);
  };

  const handleStartEdit = (item: RssItem) => {
    setEditingItemId(item.id);
    setEditedTitle(item.title);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditedTitle("");
  };

  const handleSaveEdit = async (itemId: string) => {
    if (!editedTitle.trim()) {
      alert("Title cannot be empty");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await updateRssItemTitle(itemId, editedTitle);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, title: editedTitle.trim() } : item
        )
      );
      
      setEditingItemId(null);
      setEditedTitle("");
    } catch (error) {
      console.error("Error updating title:", error);
      alert("Failed to update title");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickFilter = (filter: "today" | "week" | "month") => {
    const now = new Date();
    const params = new URLSearchParams();
    
    // Keep existing filters
    if (statusFilter) params.set("status", statusFilter);
    if (feedFilter) params.set("feedId", feedFilter);
    
    // Set sort to fetched_at with desc order for time-based filters
    params.set("sortBy", "fetched_at");
    params.set("sortOrder", "desc");
    params.set("page", "1");
    
    router.push(`/admin/rss/items?${params.toString()}`);
  };

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (feedFilter) params.set("feedId", feedFilter);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    params.set("page", "1"); // Reset to page 1 when filtering
    router.push(`/admin/rss/items?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (feedFilter) params.set("feedId", feedFilter);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);
    params.set("page", newPage.toString());
    router.push(`/admin/rss/items?${params.toString()}`);
  };

  const handleSortChange = (column: string) => {
    const newSortOrder = sortBy === column && sortOrder === "desc" ? "asc" : "desc";
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (feedFilter) params.set("feedId", feedFilter);
    params.set("sortBy", column);
    params.set("sortOrder", newSortOrder);
    params.set("page", "1");
    router.push(`/admin/rss/items?${params.toString()}`);
  };

  const handleToggleSelect = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "published":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Main Filters Row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="published">Published</option>
            </select>

            <select
              value={feedFilter}
              onChange={(e) => setFeedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Feeds</option>
              {feeds.map((feed) => (
                <option key={feed.id} value={feed.id}>
                  {feed.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleFilterChange}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Apply Filters
            </button>
          </div>

          {/* Quick Date Filters Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">Quick filters:</span>
            <button
              onClick={() => handleQuickFilter("today")}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              Today
            </button>
            <button
              onClick={() => handleQuickFilter("week")}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              This Week
            </button>
            <button
              onClick={() => handleQuickFilter("month")}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-blue-900 font-medium">
              {selectedItems.size} item(s) selected
            </span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleBulkApprove}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={handleBulkDisapprove}
                disabled={isProcessing}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Set to Pending
              </button>
              <button
                onClick={handleBulkReject}
                disabled={isProcessing}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === items.length && items.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  <button
                    onClick={() => handleSortChange("title")}
                    className="flex items-center gap-1 hover:text-red-600 transition-colors"
                  >
                    Title
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "title" ? "text-red-600" : ""}`} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-40">
                  <button
                    onClick={() => handleSortChange("feed_id")}
                    className="flex items-center gap-1 hover:text-red-600 transition-colors"
                  >
                    Source
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "feed_id" ? "text-red-600" : ""}`} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-32">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-40">
                  <button
                    onClick={() => handleSortChange("published_at")}
                    className="flex items-center gap-1 hover:text-red-600 transition-colors"
                  >
                    Published
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "published_at" ? "text-red-600" : ""}`} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-40">
                  <button
                    onClick={() => handleSortChange("fetched_at")}
                    className="flex items-center gap-1 hover:text-red-600 transition-colors"
                  >
                    Fetched
                    <ArrowUpDown className={`w-3 h-3 ${sortBy === "fetched_at" ? "text-red-600" : ""}`} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-56">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No RSS items found
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isEditing = editingItemId === item.id;
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex items-start gap-2">
                                <input
                                  type="text"
                                  value={editedTitle}
                                  onChange={(e) => setEditedTitle(e.target.value)}
                                  className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleSaveEdit(item.id);
                                    } else if (e.key === "Escape") {
                                      handleCancelEdit();
                                    }
                                  }}
                                />
                                <div className="flex gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => handleSaveEdit(item.id)}
                                    disabled={isProcessing}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                    title="Save"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start gap-2">
                                <p className="font-medium text-gray-900 line-clamp-2 flex-1">
                                  {item.title}
                                </p>
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                                  title="Edit title"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                            {item.description && !isEditing && (
                              <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900">
                          {item.feed?.name || "Unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {item.published_at
                            ? new Date(item.published_at).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600" title={new Date(item.fetched_at).toLocaleString()}>
                          {new Date(item.fetched_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handlePreview(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {item.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(item.id, "approved")}
                                disabled={isProcessing}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(item.id, "rejected")}
                                disabled={isProcessing}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {(item.status === "approved" || item.status === "rejected") && (
                            <button
                              onClick={() => handleDisapprove(item.id)}
                              disabled={isProcessing}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Set to Pending"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="View Original"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isProcessing}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing page {currentPage} of {totalPages} ({totalCount} total items)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? "bg-red-600 text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedItem && (
        <RssItemPreviewModal
          item={selectedItem}
          onClose={() => setShowPreview(false)}
          onApprove={() => {
            handleStatusChange(selectedItem.id, "approved");
            setShowPreview(false);
          }}
          onReject={() => {
            handleStatusChange(selectedItem.id, "rejected");
            setShowPreview(false);
          }}
        />
      )}
    </>
  );
}
