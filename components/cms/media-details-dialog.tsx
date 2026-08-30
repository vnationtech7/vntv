"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getMediaAsset,
  updateMediaAsset,
  type MediaAsset,
  type MediaAssetFormData,
} from "@/app/admin/media/actions";
import { X, Image as ImageIcon, FileText, Download, Copy, Check } from "lucide-react";

interface MediaDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mediaId: string | null;
}

export function MediaDetailsDialog({
  isOpen,
  onClose,
  onSuccess,
  mediaId,
}: MediaDetailsDialogProps) {
  const [media, setMedia] = useState<MediaAsset | null>(null);
  const [formData, setFormData] = useState<MediaAssetFormData>({
    alt_text: "",
    caption: "",
    credit: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && mediaId) {
      loadMedia();
    } else {
      setMedia(null);
      setFormData({ alt_text: "", caption: "", credit: "" });
      setError(null);
    }
  }, [isOpen, mediaId]);

  const loadMedia = async () => {
    if (!mediaId) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getMediaAsset(mediaId);

    if (data) {
      setMedia(data);
      setFormData({
        alt_text: data.alt_text || "",
        caption: data.caption || "",
        credit: data.credit || "",
      });
    } else if (fetchError) {
      setError(fetchError);
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaId) return;

    setSaving(true);
    setError(null);

    const { data, error: saveError } = await updateMediaAsset(
      mediaId,
      formData
    );

    if (data) {
      onSuccess();
      onClose();
    } else if (saveError) {
      setError(saveError);
    }

    setSaving(false);
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!isOpen || !mediaId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-background-panel shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background-panel p-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Media Details
            </h2>
            {media && (
              <p className="mt-1 text-sm text-text-secondary">
                {media.file_name}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center text-text-secondary">
            Loading media details...
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={loadMedia} className="mt-4">
              Retry
            </Button>
          </div>
        ) : media ? (
          <div className="grid gap-6 p-6 lg:grid-cols-2">
            {/* Left Column - Preview and Info */}
            <div className="space-y-6">
              {/* Preview */}
              <div className="overflow-hidden rounded-lg border border-border bg-background-secondary">
                {media.media_type === "image" ? (
                  <img
                    src={media.public_url}
                    alt={media.alt_text || media.file_name}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center">
                    <FileText className="h-16 w-16 text-text-tertiary" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                <h3 className="font-semibold text-text-primary">File Information</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Type:</span>
                    <span className="font-medium text-text-primary capitalize">
                      {media.media_type}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Format:</span>
                    <span className="font-medium text-text-primary">
                      {media.mime_type}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Size:</span>
                    <span className="font-medium text-text-primary">
                      {formatFileSize(media.file_size)}
                    </span>
                  </div>
                  
                  {media.width && media.height && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Dimensions:</span>
                      <span className="font-medium text-text-primary">
                        {media.width} × {media.height} px
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Uploaded:</span>
                    <span className="font-medium text-text-primary">
                      {new Date(media.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Public URL */}
                <div className="pt-3 border-t border-border">
                  <label className="block text-xs font-medium text-text-secondary mb-2">
                    Public URL
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={media.public_url}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(media.public_url)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-border flex gap-2">
                  <a
                    href={media.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button type="button" variant="outline" size="sm" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </a>
                  <a
                    href={media.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button type="button" variant="outline" size="sm" className="w-full">
                      <ImageIcon className="mr-2 h-4 w-4" />
                      View Full
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column - Metadata Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-lg border border-border bg-background p-4 space-y-4">
                  <h3 className="font-semibold text-text-primary">
                    Media Metadata
                  </h3>

                  {/* Alt Text */}
                  <div>
                    <label
                      htmlFor="alt_text"
                      className="mb-1 block text-sm font-medium text-text-primary"
                    >
                      Alt Text
                    </label>
                    <Input
                      id="alt_text"
                      value={formData.alt_text}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          alt_text: e.target.value,
                        }))
                      }
                      placeholder="Describe the image for accessibility"
                    />
                    <p className="mt-1 text-xs text-text-tertiary">
                      Helps screen readers and SEO. Describe what's in the image.
                    </p>
                  </div>

                  {/* Caption */}
                  <div>
                    <label
                      htmlFor="caption"
                      className="mb-1 block text-sm font-medium text-text-primary"
                    >
                      Caption
                    </label>
                    <Textarea
                      id="caption"
                      value={formData.caption}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          caption: e.target.value,
                        }))
                      }
                      placeholder="Add a caption to display with the image"
                      rows={3}
                    />
                    <p className="mt-1 text-xs text-text-tertiary">
                      Visible text shown below the image (optional)
                    </p>
                  </div>

                  {/* Credit */}
                  <div>
                    <label
                      htmlFor="credit"
                      className="mb-1 block text-sm font-medium text-text-primary"
                    >
                      Credit / Attribution
                    </label>
                    <Input
                      id="credit"
                      value={formData.credit}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          credit: e.target.value,
                        }))
                      }
                      placeholder="Photo by John Doe / Source Name"
                    />
                    <p className="mt-1 text-xs text-text-tertiary">
                      Photographer, source, or copyright information
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                      {error}
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
