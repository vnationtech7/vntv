"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MediaUploadDialog } from "@/components/cms/media-upload-dialog";
import { MediaDetailsDialog } from "@/components/cms/media-details-dialog";
import {
  getMediaAssets,
  getMediaStats,
  deleteMediaAsset,
  type MediaAsset,
} from "./actions";
import {
  Upload,
  Grid3x3,
  List,
  Search,
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  Edit,
  Download,
  Copy,
  Check,
} from "lucide-react";

type ViewMode = "grid" | "list";
type FilterType = "all" | "image" | "video" | "document";

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [stats, setStats] = useState({
    images: 0,
    videos: 0,
    documents: 0,
    total: 0,
    totalSize: 0,
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy ID");
    }
  };

  const loadMedia = async () => {
    setLoading(true);
    const filters: any = {};
    
    if (filter !== "all") {
      filters.mediaType = filter;
    }
    
    if (search.trim()) {
      filters.search = search.trim();
    }

    const { data, error } = await getMediaAssets(filters);
    if (data) {
      setMedia(data);
    } else if (error) {
      console.error("Failed to load media:", error);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const stats = await getMediaStats();
    setStats(stats);
  };

  useEffect(() => {
    loadMedia();
    loadStats();
  }, [filter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMedia();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    const { error } = await deleteMediaAsset(id);

    if (error) {
      alert(`Failed to delete: ${error}`);
    } else {
      await loadMedia();
      await loadStats();
    }

    setDeletingId(null);
  };

  const handleEdit = (id: string) => {
    setSelectedMediaId(id);
    setDetailsDialogOpen(true);
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "document":
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Media Library"
        description="Manage images, videos, and documents"
        action={
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-border bg-background-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Files</p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.total}
              </p>
            </div>
            <FileText className="h-8 w-8 text-text-tertiary" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Images</p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.images}
              </p>
            </div>
            <ImageIcon className="h-8 w-8 text-text-tertiary" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Videos</p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.videos}
              </p>
            </div>
            <Video className="h-8 w-8 text-text-tertiary" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Documents</p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.documents}
              </p>
            </div>
            <FileText className="h-8 w-8 text-text-tertiary" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Size</p>
              <p className="text-2xl font-bold text-text-primary">
                {formatFileSize(stats.totalSize)}
              </p>
            </div>
            <Upload className="h-8 w-8 text-text-tertiary" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "image" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("image")}
          >
            <ImageIcon className="mr-1 h-3 w-3" />
            Images
          </Button>
          <Button
            variant={filter === "video" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("video")}
          >
            <Video className="mr-1 h-3 w-3" />
            Videos
          </Button>
          <Button
            variant={filter === "document" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter("document")}
          >
            <FileText className="mr-1 h-3 w-3" />
            Documents
          </Button>
        </div>

        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <Input
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-vntv-red text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              aria-label="Grid view"
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-vntv-red text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Media Content */}
      <div className="mt-6">
        {loading ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center text-text-secondary">
            Loading media...
          </div>
        ) : media.length === 0 ? (
          <div className="rounded-lg border border-border bg-background-panel p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-text-tertiary" />
            <p className="mt-2 text-text-secondary">
              {search ? "No media found matching your search" : "No media files yet"}
            </p>
            <Button onClick={() => setUploadDialogOpen(true)} className="mt-4">
              <Upload className="mr-2 h-4 w-4" />
              Upload Your First File
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {media.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-background-panel transition-all hover:border-vntv-red hover:shadow-lg"
              >
                {/* Image/Video Preview */}
                <div className="aspect-square bg-background-secondary">
                  {item.media_type === "image" ? (
                    <img
                      src={item.public_url}
                      alt={item.alt_text || item.file_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {getMediaIcon(item.media_type)}
                    </div>
                  )}
                </div>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="rounded bg-white p-2 text-black hover:bg-gray-200"
                    aria-label="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <a
                    href={item.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-white p-2 text-black hover:bg-gray-200"
                    aria-label="View"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(item.id, item.file_name)}
                    disabled={deletingId === item.id}
                    className="rounded bg-red-500 p-2 text-white hover:bg-red-600 disabled:opacity-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* File Info */}
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-text-primary">
                    {item.file_name}
                  </p>
                  <div className="flex items-center justify-between gap-1 mt-1">
                    <p className="text-xs text-text-tertiary truncate flex-1">
                      {formatFileSize(item.file_size)}
                    </p>
                    <button
                      onClick={() => handleCopyId(item.id)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-tertiary hover:bg-surface-hover text-text-tertiary hover:text-text-primary transition-colors"
                      title="Copy ID"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span className="text-xs">ID</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead className="bg-background-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-tertiary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background-panel">
                {media.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-background-secondary"
                  >
                    <td className="px-6 py-4">
                      <div className="h-12 w-12 overflow-hidden rounded border border-border">
                        {item.media_type === "image" ? (
                          <img
                            src={item.public_url}
                            alt={item.alt_text || item.file_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-background-secondary">
                            {getMediaIcon(item.media_type)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="truncate font-medium text-text-primary">
                          {item.file_name}
                        </p>
                        {item.alt_text && (
                          <p className="truncate text-sm text-text-secondary">
                            {item.alt_text}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleCopyId(item.id)}
                        className="flex items-center gap-2 px-2 py-1 rounded bg-surface-tertiary hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors text-xs font-mono"
                        title="Click to copy full ID"
                      >
                        <span className="truncate max-w-[100px]">{item.id.substring(0, 8)}...</span>
                        {copiedId === item.id ? (
                          <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                        ) : (
                          <Copy className="h-3 w-3 flex-shrink-0" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{item.media_type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {formatFileSize(item.file_size)}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="text-text-secondary hover:text-vntv-red"
                          aria-label="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <a
                          href={item.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-secondary hover:text-vntv-red"
                          aria-label="View"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(item.id, item.file_name)}
                          disabled={deletingId === item.id}
                          className="text-text-secondary hover:text-red-500 disabled:opacity-50"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Upload Dialog */}
      <MediaUploadDialog
        isOpen={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={() => {
          loadMedia();
          loadStats();
        }}
      />

      {/* Details/Edit Dialog */}
      <MediaDetailsDialog
        isOpen={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedMediaId(null);
        }}
        onSuccess={() => {
          loadMedia();
        }}
        mediaId={selectedMediaId}
      />
    </AdminLayout>
  );
}
