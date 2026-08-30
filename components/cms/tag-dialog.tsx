"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createTag,
  updateTag,
  type Tag,
  type TagFormData,
} from "@/app/admin/tags/actions";
import { generateSlug } from "@/lib/utils/slug";
import { X } from "lucide-react";

interface TagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tag?: Tag | null;
}

export function TagDialog({
  isOpen,
  onClose,
  onSuccess,
  tag,
}: TagDialogProps) {
  const [formData, setFormData] = useState<TagFormData>({
    name: "",
    slug: "",
  });
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when tag changes
  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name,
        slug: tag.slug,
      });
      setAutoSlug(false);
    } else {
      setFormData({
        name: "",
        slug: "",
      });
      setAutoSlug(true);
    }
    setError(null);
  }, [tag, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: autoSlug ? generateSlug(value) : prev.slug,
    }));
  };

  const handleSlugChange = (value: string) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        setError("Tag name is required");
        setLoading(false);
        return;
      }

      if (!formData.slug.trim()) {
        setError("Tag slug is required");
        setLoading(false);
        return;
      }

      // Create or update tag
      const result = tag
        ? await updateTag(tag.id, formData)
        : await createTag(formData);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Success
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Form submission error:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg rounded-lg bg-background-panel p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">
            {tag ? "Edit Tag" : "Create Tag"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Name *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Breaking News, Technology"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Slug *
              </label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g., breaking-news, technology"
                required
              />
              <p className="mt-1 text-xs text-text-tertiary">
                URL-friendly version of the name. Auto-generated from name.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : tag ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
  );
}
