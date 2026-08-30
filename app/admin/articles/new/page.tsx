"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createArticle,
  type ArticleFormData,
  type ArticleStatus,
} from "../actions";
import { generateSlug } from "@/lib/utils/slug";
import { getCategories } from "../../categories/actions";
import { getAuthors } from "../../authors/actions";
import { getTags } from "../../tags/actions";
import { MediaPickerDialog } from "@/components/cms/media-picker-dialog";
import { type MediaAsset } from "../../media/actions";
import { ArrowLeft, Save, Image as ImageIcon, X } from "lucide-react";

export default function NewArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSlug, setAutoSlug] = useState(true);
  const hasLoadedData = useRef(false);

  // Form data
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    slug: "",
    excerpt: "",
    body: [],
    category_id: "",
    author_id: "",
    status: "draft",
    is_breaking: false,
    is_featured: false,
    is_exclusive: false,
    is_sponsored: false,
    sponsor_label: "",
    seo_title: "",
    seo_description: "",
    tag_ids: [],
  });

  const [bodyText, setBodyText] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);

  // Load dropdown data once
  useEffect(() => {
    if (hasLoadedData.current) return;
    hasLoadedData.current = true;

    async function loadData() {
      try {
        const [catRes, authRes, tagRes] = await Promise.all([
          getCategories({ includeInactive: false }),
          getAuthors({ includeInactive: false }),
          getTags(),
        ]);

        if (catRes.data) setCategories(catRes.data);
        if (authRes.data) setAuthors(authRes.data);
        if (tagRes.data) setTags(tagRes.data);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    }

    loadData();
  }, []);

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: autoSlug ? generateSlug(value) : prev.slug,
    }));
  };

  const handleSlugChange = (value: string) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: value }));
  };

  const handleTagToggle = (tagId: string) => {
    setFormData((prev) => {
      const currentTags = prev.tag_ids || [];
      const isSelected = currentTags.includes(tagId);
      return {
        ...prev,
        tag_ids: isSelected
          ? currentTags.filter((id) => id !== tagId)
          : [...currentTags, tagId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (!formData.title.trim()) {
        setError("Title is required");
        setSaving(false);
        return;
      }

      if (!formData.slug.trim()) {
        setError("Slug is required");
        setSaving(false);
        return;
      }

      const bodyBlocks = bodyText
        .split("\n\n")
        .filter((p) => p.trim())
        .map((paragraph) => ({
          type: "paragraph",
          content: paragraph.trim(),
        }));

      const submissionData: ArticleFormData = {
        ...formData,
        body: bodyBlocks,
        featured_image_id: selectedMedia?.id || null,
      };

      const result = await createArticle(submissionData);

      if (result.error) {
        setError(result.error);
        setSaving(false);
        return;
      }

      router.push("/admin/articles");
    } catch (err) {
      console.error("Form submission error:", err);
      setError("An unexpected error occurred");
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Create Article"
        description="Create a new article for your publication"
        action={
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {error && (
        <div className="mt-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Basic Info */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Basic Information
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Title *
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Article title"
                required
              />
            </div>

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
                placeholder="article-slug"
                required
              />
              <p className="mt-1 text-xs text-text-tertiary">
                URL-friendly version. Auto-generated from title.
              </p>
            </div>

            <div>
              <label
                htmlFor="excerpt"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Excerpt
              </label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                placeholder="Brief summary of the article"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Content
          </h3>
          <div>
            <label
              htmlFor="body"
              className="mb-1 block text-sm font-medium text-text-primary"
            >
              Article Body
            </label>
            <Textarea
              id="body"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Write your article content here. Separate paragraphs with blank lines."
              rows={15}
              className="font-mono text-sm"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Separate paragraphs with blank lines. Rich editor coming soon.
            </p>
          </div>
        </div>

        {/* Featured Image */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Featured Image
          </h3>

          {selectedMedia ? (
            <div className="space-y-3">
              <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-border">
                <img
                  src={selectedMedia.public_url}
                  alt={selectedMedia.alt_text || selectedMedia.file_name}
                  className="h-auto w-full"
                />
                <button
                  type="button"
                  onClick={() => setSelectedMedia(null)}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {selectedMedia.file_name}
                </p>
                {selectedMedia.alt_text && (
                  <p className="text-xs text-text-secondary">
                    {selectedMedia.alt_text}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMediaPickerOpen(true)}
              >
                Change Image
              </Button>
            </div>
          ) : (
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMediaPickerOpen(true)}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Select Featured Image
              </Button>
              <p className="mt-2 text-xs text-text-tertiary">
                Choose an image from your media library
              </p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Metadata
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="category_id"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Category
              </label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category_id: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="author_id"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Author
              </label>
              <select
                id="author_id"
                value={formData.author_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    author_id: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
              >
                <option value="">Select author</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as ArticleStatus,
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
              >
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-text-primary">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <p className="text-sm text-text-tertiary">No tags available</p>
              ) : (
                tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-background-panel-2"
                  >
                    <Checkbox
                      checked={formData.tag_ids?.includes(tag.id)}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                    />
                    <span className="text-text-primary">{tag.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Flags */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Article Flags
          </h3>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={formData.is_breaking}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_breaking: checked === true,
                  }))
                }
              />
              <span className="text-sm text-text-primary">Breaking News</span>
            </label>

            <label className="flex items-center gap-2">
              <Checkbox
                checked={formData.is_featured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_featured: checked === true,
                  }))
                }
              />
              <span className="text-sm text-text-primary">Featured</span>
            </label>

            <label className="flex items-center gap-2">
              <Checkbox
                checked={formData.is_exclusive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_exclusive: checked === true,
                  }))
                }
              />
              <span className="text-sm text-text-primary">Exclusive</span>
            </label>

            <label className="flex items-center gap-2">
              <Checkbox
                checked={formData.is_sponsored}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_sponsored: checked === true,
                  }))
                }
              />
              <span className="text-sm text-text-primary">Sponsored</span>
            </label>
          </div>

          {formData.is_sponsored && (
            <div className="mt-4">
              <label
                htmlFor="sponsor_label"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Sponsor Label
              </label>
              <Input
                id="sponsor_label"
                value={formData.sponsor_label}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sponsor_label: e.target.value,
                  }))
                }
                placeholder="e.g., Sponsored by Company Name"
              />
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            SEO Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="seo_title"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                SEO Title
              </label>
              <Input
                id="seo_title"
                value={formData.seo_title}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seo_title: e.target.value,
                  }))
                }
                placeholder="Custom title for search engines"
              />
            </div>

            <div>
              <label
                htmlFor="seo_description"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                SEO Description
              </label>
              <Textarea
                id="seo_description"
                value={formData.seo_description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seo_description: e.target.value,
                  }))
                }
                placeholder="Description for search engines"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Create Article"}
          </Button>
        </div>
      </form>

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(media) => setSelectedMedia(media)}
        selectedId={selectedMedia?.id}
        mediaType="image"
        mode="single"
      />
    </AdminLayout>
  );
}
