"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createCategory,
  updateCategory,
  type Category,
  type CategoryFormData,
} from "@/app/admin/categories/actions";
import { generateSlug } from "@/lib/utils/slug";
import { X } from "lucide-react";

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
  parentCategories?: Category[];
}

export function CategoryDialog({
  isOpen,
  onClose,
  onSuccess,
  category,
  parentCategories = [],
}: CategoryDialogProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    parent_id: "",
    display_order: 0,
    is_active: true,
  });
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        parent_id: category.parent_id || "",
        display_order: category.display_order,
        is_active: category.is_active,
      });
      setAutoSlug(false);
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        parent_id: "",
        display_order: parentCategories.length,
        is_active: true,
      });
      setAutoSlug(true);
    }
    setError(null);
  }, [category, parentCategories, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when dialog is open
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
        setError("Category name is required");
        setLoading(false);
        return;
      }

      if (!formData.slug.trim()) {
        setError("Category slug is required");
        setLoading(false);
        return;
      }

      // Create or update category
      const result = category
        ? await updateCategory(category.id, formData)
        : await createCategory(formData);

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
      <div className="relative w-full max-w-2xl rounded-lg bg-background-panel p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">
            {category ? "Edit Category" : "Create Category"}
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
                placeholder="e.g., Politics, Business"
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
                placeholder="e.g., politics, business"
                required
              />
              <p className="mt-1 text-xs text-text-tertiary">
                URL-friendly version of the name. Auto-generated if left empty.
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>

            {/* Parent Category */}
            <div>
              <label
                htmlFor="parent_id"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Parent Category
              </label>
              <select
                id="parent_id"
                value={formData.parent_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    parent_id: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
              >
                <option value="">None (Top-level category)</option>
                {parentCategories
                  .filter((cat) => cat.id !== category?.id) // Prevent selecting self as parent
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Display Order */}
            <div>
              <label
                htmlFor="display_order"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Display Order
              </label>
              <Input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_order: parseInt(e.target.value) || 0,
                  }))
                }
              />
              <p className="mt-1 text-xs text-text-tertiary">
                Lower numbers appear first in the list
              </p>
            </div>

            {/* Is Active */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_active: checked === true,
                  }))
                }
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium text-text-primary"
              >
                Active (visible on site)
              </label>
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
                {loading ? "Saving..." : category ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
  );
}
