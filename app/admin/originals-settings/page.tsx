"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaPickerDialog } from "@/components/cms/media-picker-dialog";
import { type MediaAsset } from "@/app/admin/media/actions";
import { getOriginalsSettings, updateOriginalsSettings, type OriginalsSettings } from "@/app/actions/originals";
import { Save, Image as ImageIcon, X } from "lucide-react";

export default function OriginalsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<MediaAsset | null>(null);

  const [formData, setFormData] = useState<OriginalsSettings>({
    title: "VNTV Originals",
    description: "Exclusive content you won't find anywhere else. Stories that matter, told our way.",
    cta_text: "Watch Now",
    background_image_path: null,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data, error: fetchError } = await getOriginalsSettings();
    
    if (data) {
      setFormData(data);
      // Load background image if exists
      if (data.background_image_path) {
        // Extract the media asset ID or path info if needed
        // For now, just store the path
      }
    } else if (fetchError) {
      setError(fetchError);
    }
    
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const submissionData: OriginalsSettings = {
      ...formData,
      background_image_path: backgroundImage?.storage_path || null,
    };

    const result = await updateOriginalsSettings(submissionData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Failed to save settings");
    }

    setSaving(false);
  };

  const getImageUrl = (storagePath: string | null) => {
    if (!storagePath) return null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/${storagePath}`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-8">
          <p className="text-text-secondary">Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader
        title="VNTV Originals Settings"
        description="Configure the homepage originals promo section"
      />

      {error && (
        <div className="mt-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-lg bg-green-500/10 p-4 text-sm text-green-500">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Content Settings */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Content Settings
          </h3>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Title
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="VNTV Originals"
                required
              />
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
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description of VNTV Originals"
                rows={3}
                required
              />
            </div>

            {/* CTA Text */}
            <div>
              <label
                htmlFor="cta_text"
                className="mb-1 block text-sm font-medium text-text-primary"
              >
                Call-to-Action Text
              </label>
              <Input
                id="cta_text"
                value={formData.cta_text}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cta_text: e.target.value }))
                }
                placeholder="Watch Now"
                required
              />
            </div>
          </div>
        </div>

        {/* Background Image */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Background Image
          </h3>

          {backgroundImage || formData.background_image_path ? (
            <div className="space-y-3">
              <div className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-border">
                <img
                  src={backgroundImage?.public_url || getImageUrl(formData.background_image_path) || ''}
                  alt="Background"
                  className="h-auto w-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    setBackgroundImage(null);
                    setFormData((prev) => ({ ...prev, background_image_path: null }));
                  }}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {backgroundImage?.file_name || "Current background image"}
                </p>
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
                Select Background Image
              </Button>
              <p className="mt-2 text-xs text-text-tertiary">
                Choose a high-quality image for the originals promo background
              </p>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-border bg-background-panel p-6">
          <h3 className="mb-4 text-lg font-semibold text-text-primary">
            Preview
          </h3>
          
          <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-[#1c0d10] to-[#0b0b0d] min-h-[200px]">
            {/* Background Image Preview */}
            {(backgroundImage || formData.background_image_path) && (
              <>
                <div className="absolute inset-0 opacity-35">
                  <img
                    src={backgroundImage?.public_url || getImageUrl(formData.background_image_path) || ''}
                    alt="Background Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
              </>
            )}

            {/* Content Preview */}
            <div className="relative z-10 p-8">
              <div className="mb-3">
                <span className="text-xs font-extrabold tracking-[2px] text-gray-400">
                  EXCLUSIVE <span className="text-vntv-red">SERIES</span>
                </span>
              </div>
              <h3 className="text-2xl font-extrabold mb-2">
                {formData.title}
              </h3>
              <p className="text-sm text-gray-400 mb-4 max-w-md">
                {formData.description}
              </p>
              <div className="inline-flex items-center gap-2 bg-vntv-red text-white text-xs font-extrabold px-4 py-2 rounded">
                {formData.cta_text}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(media) => setBackgroundImage(media)}
        selectedId={backgroundImage?.id}
        mediaType="image"
        mode="single"
      />
    </AdminLayout>
  );
}
