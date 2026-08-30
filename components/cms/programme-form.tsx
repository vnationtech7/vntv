"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { createProgramme, updateProgramme, type ProgrammeData } from "@/app/actions/programme";
import { generateSlug } from "@/lib/utils/slug";
import { MediaUploadOrSearch } from "@/components/cms/media-upload-or-search";
import { Loader2 } from "lucide-react";

interface ProgrammeFormProps {
  programme?: ProgrammeData;
  mode: "create" | "edit";
}

const PROGRAMME_TYPES = [
  { value: "talk_show", label: "Talk Show" },
  { value: "documentary", label: "Documentary" },
  { value: "news_analysis", label: "News Analysis" },
  { value: "entertainment", label: "Entertainment" },
  { value: "sports", label: "Sports" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "other", label: "Other" },
];

export function ProgrammeForm({ programme, mode }: ProgrammeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: programme?.name || "",
    slug: programme?.slug || "",
    description: programme?.description || "",
    presenter: programme?.presenter || "",
    programme_type: programme?.programme_type || "",
    poster_id: programme?.poster_id || "",
    is_active: programme?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let result;

      if (mode === "create") {
        result = await createProgramme(formData);
      } else {
        result = await updateProgramme(programme!.id, formData);
      }

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      router.push("/admin/programmes");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      // Auto-generate slug from name if creating new programme
      slug: mode === "create" ? generateSlug(name) : prev.slug,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
          Programme Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
          placeholder="e.g., The Africa Report"
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-text-primary mb-2">
          URL Slug *
        </label>
        <input
          type="text"
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
          placeholder="the-africa-report"
        />
        <p className="text-xs text-text-tertiary mt-1">
          URL: /originals/{formData.slug || "programme-slug"}
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow resize-none"
          placeholder="Brief description of the programme..."
        />
      </div>

      {/* Presenter */}
      <div>
        <label htmlFor="presenter" className="block text-sm font-medium text-text-primary mb-2">
          Presenter/Host
        </label>
        <input
          type="text"
          id="presenter"
          value={formData.presenter}
          onChange={(e) => setFormData({ ...formData, presenter: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
          placeholder="e.g., John Doe"
        />
      </div>

      {/* Programme Type */}
      <div>
        <label htmlFor="programme_type" className="block text-sm font-medium text-text-primary mb-2">
          Programme Type
        </label>
        <select
          id="programme_type"
          value={formData.programme_type}
          onChange={(e) => setFormData({ ...formData, programme_type: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-surface-secondary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
        >
          <option value="">Select type...</option>
          {PROGRAMME_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Poster Image */}
      <MediaUploadOrSearch
        value={formData.poster_id}
        onChange={(value) => setFormData({ ...formData, poster_id: value })}
        mediaType="image"
        label="Poster Image"
        uploadLabel="Upload Poster"
        searchPlaceholder="Search for poster image..."
        accept="image/*"
      />

      {/* Active Status */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="w-4 h-4 rounded border-border text-accent-yellow focus:ring-accent-yellow"
        />
        <label htmlFor="is_active" className="text-sm text-text-primary">
          Active (visible on public site)
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === "create" ? "Creating..." : "Saving..."}
            </>
          ) : (
            mode === "create" ? "Create Programme" : "Save Changes"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
