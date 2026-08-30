"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getMediaAssets, type MediaAsset } from "@/app/admin/media/actions";
import { MediaUploadDialog } from "./media-upload-dialog";
import {
  Search,
  Image as ImageIcon,
  FileText,
  Check,
  Upload,
  Plus,
} from "lucide-react";

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: MediaAsset) => void;
  selectedId?: string | null;
  mediaType?: "image" | "video" | "document" | "all";
  mode?: "single" | "multiple";
  onSelectMultiple?: (media: MediaAsset[]) => void;
}

type FilterType = "all" | "image" | "video" | "document";

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  selectedId,
  mediaType = "all",
  mode = "single",
  onSelectMultiple,
}: MediaPickerDialogProps) {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>(mediaType);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const loadMedia = async () => {
    setLoading(true);
    const filters: any = {};

    if (filter !== "all") {
      filters.type = filter;
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

  useEffect(() => {
    if (open) {
      loadMedia();
      // Reset selections when opening
      if (selectedId) {
        setSelectedItems(new Set([selectedId]));
      } else {
        setSelectedItems(new Set());
      }
    }
  }, [open, filter]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      loadMedia();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (item: MediaAsset) => {
    if (mode === "single") {
      onSelect(item);
      onOpenChange(false);
    } else {
      // Toggle selection
      const newSelected = new Set(selectedItems);
      if (newSelected.has(item.id)) {
        newSelected.delete(item.id);
      } else {
        newSelected.add(item.id);
      }
      setSelectedItems(newSelected);
    }
  };

  const handleConfirmMultiple = () => {
    if (onSelectMultiple) {
      const selectedMedia = media.filter((m) => selectedItems.has(m.id));
      onSelectMultiple(selectedMedia);
      onOpenChange(false);
    }
  };

  const handleUploadSuccess = () => {
    // Reload media after successful upload
    loadMedia();
    setUploadDialogOpen(false);
  };

  const getMediaIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon;
    if (type.startsWith("video/")) return ImageIcon;
    return FileText;
  };

  const isImage = (mimeType: string) => mimeType.startsWith("image/");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
          <DialogDescription>
            {mode === "single"
              ? "Choose an item from your media library"
              : "Choose one or more items from your media library"}
          </DialogDescription>
        </DialogHeader>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 border-b border-border pb-4">
          {/* Top row: Upload button */}
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={() => {
                console.log("Upload New button clicked in MediaPickerDialog");
                setUploadDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Upload New
            </Button>
          </div>

          {/* Bottom row: Filters and Search */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
                Images
              </Button>
              <Button
                variant={filter === "video" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("video")}
              >
                Videos
              </Button>
              <Button
                variant={filter === "document" ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter("document")}
              >
                Documents
              </Button>
            </div>

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
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-text-secondary">
              Loading media...
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Upload className="h-12 w-12 text-text-tertiary mb-3" />
              <p className="text-text-secondary mb-2">
                {search
                  ? "No media found matching your search"
                  : "No media available yet"}
              </p>
              {!search && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadDialogOpen(true)}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Your First Image
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {media.map((item) => {
                const Icon = getMediaIcon(item.mime_type);
                const isSelected =
                  mode === "single"
                    ? item.id === selectedId
                    : selectedItems.has(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`
                      group relative overflow-hidden rounded-lg border-2 transition-all
                      ${
                        isSelected
                          ? "border-vntv-red ring-2 ring-vntv-red/20"
                          : "border-border hover:border-vntv-red/50"
                      }
                    `}
                  >
                    {/* Thumbnail/Preview */}
                    <div className="aspect-square bg-background-secondary">
                      {isImage(item.mime_type) ? (
                        <img
                          src={item.public_url}
                          alt={item.alt_text || item.file_name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Icon className="h-12 w-12 text-text-tertiary" />
                        </div>
                      )}
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-vntv-red/20 backdrop-blur-[2px]">
                        <div className="rounded-full bg-vntv-red p-2">
                          <Check className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}

                    {/* File Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="truncate text-xs font-medium text-white">
                        {item.file_name}
                      </p>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute left-2 top-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.mime_type.split("/")[1].toUpperCase()}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        {mode === "multiple" && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-text-secondary">
              {selectedItems.size} item{selectedItems.size !== 1 ? "s" : ""}{" "}
              selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmMultiple}
                disabled={selectedItems.size === 0}
              >
                Select {selectedItems.size > 0 && `(${selectedItems.size})`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Upload Dialog */}
      <MediaUploadDialog
        isOpen={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </Dialog>
  );
}
