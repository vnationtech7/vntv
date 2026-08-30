"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createAuthor,
  updateAuthor,
  getUserProfiles,
  type Author,
  type AuthorFormData,
} from "@/app/admin/authors/actions";
import { generateSlug } from "@/lib/utils/slug";
import { X, Plus, Trash2 } from "lucide-react";

interface AuthorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  author?: Author | null;
}

export function AuthorDialog({
  isOpen,
  onClose,
  onSuccess,
  author,
}: AuthorDialogProps) {
  const [formData, setFormData] = useState<AuthorFormData>({
    name: "",
    slug: "",
    bio: "",
    profile_id: "",
    social_links: {},
    is_active: true,
  });
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<
    Array<{ id: string; email: string; full_name: string | null }>
  >([]);
  const [socialFields, setSocialFields] = useState<
    Array<{ platform: string; url: string }>
  >([]);

  // Load user profiles
  useEffect(() => {
    if (isOpen) {
      getUserProfiles().then(({ data }) => {
        if (data) {
          setUserProfiles(data);
        }
      });
    }
  }, [isOpen]);

  // Initialize form data when author changes
  useEffect(() => {
    if (author) {
      setFormData({
        name: author.name,
        slug: author.slug,
        bio: author.bio || "",
        profile_id: author.profile_id || "",
        social_links: author.social_links || {},
        is_active: author.is_active,
      });
      setAutoSlug(false);

      // Convert social_links object to array for editing
      const links = Object.entries(author.social_links || {}).map(
        ([platform, url]) => ({ platform, url })
      );
      setSocialFields(links.length > 0 ? links : []);
    } else {
      setFormData({
        name: "",
        slug: "",
        bio: "",
        profile_id: "",
        social_links: {},
        is_active: true,
      });
      setAutoSlug(true);
      setSocialFields([]);
    }
    setError(null);
  }, [author, isOpen]);

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

  const addSocialLink = () => {
    setSocialFields([...socialFields, { platform: "", url: "" }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialFields(socialFields.filter((_, i) => i !== index));
  };

  const updateSocialLink = (
    index: number,
    field: "platform" | "url",
    value: string
  ) => {
    const updated = [...socialFields];
    updated[index][field] = value;
    setSocialFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        setError("Author name is required");
        setLoading(false);
        return;
      }

      if (!formData.slug.trim()) {
        setError("Author slug is required");
        setLoading(false);
        return;
      }

      // Convert social fields array to object
      const social_links: Record<string, string> = {};
      socialFields.forEach((field) => {
        if (field.platform.trim() && field.url.trim()) {
          social_links[field.platform.trim()] = field.url.trim();
        }
      });

      const submissionData: AuthorFormData = {
        ...formData,
        social_links,
      };

      // Create or update author
      const result = author
        ? await updateAuthor(author.id, submissionData)
        : await createAuthor(submissionData);

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
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-background-panel p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">
            {author ? "Edit Author" : "Create Author"}
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
                placeholder="e.g., John Doe"
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
                placeholder="e.g., john-doe"
                required
              />
              <p className="mt-1 text-xs text-text-tertiary">
                URL-friendly version of the name. Auto-generated if left empty.
              </p>
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Bio
              </label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="Brief biography of the author"
                rows={4}
              />
            </div>

            {/* Link to User Profile */}
            <div>
              <label
                htmlFor="profile_id"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Link to User Profile
              </label>
              <select
                id="profile_id"
                value={formData.profile_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    profile_id: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-vntv-red focus:outline-none focus:ring-1 focus:ring-vntv-red"
              >
                <option value="">None (Independent author)</option>
                {userProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.full_name || profile.email}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-text-tertiary">
                Optional: Link this author to a registered user account
              </p>
            </div>

            {/* Social Links */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-text-primary">
                  Social Links
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSocialLink}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Link
                </Button>
              </div>

              {socialFields.length === 0 ? (
                <p className="text-sm text-text-tertiary">
                  No social links added yet
                </p>
              ) : (
                <div className="space-y-2">
                  {socialFields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={field.platform}
                        onChange={(e) =>
                          updateSocialLink(index, "platform", e.target.value)
                        }
                        placeholder="Platform (e.g., Twitter, Facebook)"
                        className="w-1/3"
                      />
                      <Input
                        value={field.url}
                        onChange={(e) =>
                          updateSocialLink(index, "url", e.target.value)
                        }
                        placeholder="URL"
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="text-text-secondary hover:text-red-500"
                        aria-label="Remove link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                {loading ? "Saving..." : author ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </div>
      </div>
  );
}
