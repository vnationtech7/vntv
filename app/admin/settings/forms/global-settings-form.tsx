"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui";
import { Save, Loader2 } from "lucide-react";
import { GlobalSettings, updateGlobalSettings } from "@/app/actions/site-settings";

interface GlobalSettingsFormProps {
  settings: GlobalSettings;
  onChange: (updates: Partial<GlobalSettings>) => void;
  saveStatus: "idle" | "saving" | "success" | "error";
  errorMessage: string;
}

export function GlobalSettingsForm({
  settings,
  onChange,
  saveStatus: externalSaveStatus,
  errorMessage: externalErrorMessage,
}: GlobalSettingsFormProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field: keyof GlobalSettings, value: string) => {
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    onChange({ [field]: value });
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMessage("");

    try {
      const result = await updateGlobalSettings(localSettings);

      if (result.success) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setErrorMessage(result.error || "Failed to save settings");
      }
    } catch (err) {
      setSaveStatus("error");
      setErrorMessage("An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-8">
      {/* Site Identity */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Site Identity</h3>
          <p className="text-sm text-text-tertiary">Basic information about your site</p>
        </div>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="site_title">Site Title</Label>
            <Input
              id="site_title"
              value={localSettings.site_title}
              onChange={(e) => handleChange("site_title", e.target.value)}
              placeholder="VNTV - Africa. Our Stories. Our Way."
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Displayed in browser tabs and search results
            </p>
          </div>

          <div>
            <Label htmlFor="site_tagline">Site Tagline</Label>
            <Input
              id="site_tagline"
              value={localSettings.site_tagline}
              onChange={(e) => handleChange("site_tagline", e.target.value)}
              placeholder="Africa. Our Stories. Our Way."
            />
          </div>

          <div>
            <Label htmlFor="site_description">Site Description</Label>
            <Textarea
              id="site_description"
              value={localSettings.site_description}
              onChange={(e) => handleChange("site_description", e.target.value)}
              placeholder="Your trusted source for African news and stories..."
              rows={3}
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Used for SEO and about pages (160-320 characters recommended)
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Contact Information</h3>
          <p className="text-sm text-text-tertiary">How users can reach you</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={localSettings.contact_email}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              placeholder="info@vntv.africa"
            />
          </div>

          <div>
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              value={localSettings.contact_phone}
              onChange={(e) => handleChange("contact_phone", e.target.value)}
              placeholder="+233 XX XXX XXXX"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="contact_address">Physical Address</Label>
            <Textarea
              id="contact_address"
              value={localSettings.contact_address}
              onChange={(e) => handleChange("contact_address", e.target.value)}
              placeholder="Street address, city, country"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Social Media Links</h3>
          <p className="text-sm text-text-tertiary">Your social media profiles</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="social_facebook">Facebook</Label>
            <Input
              id="social_facebook"
              value={localSettings.social_facebook}
              onChange={(e) => handleChange("social_facebook", e.target.value)}
              placeholder="https://facebook.com/vntv"
            />
          </div>

          <div>
            <Label htmlFor="social_twitter">Twitter / X</Label>
            <Input
              id="social_twitter"
              value={localSettings.social_twitter}
              onChange={(e) => handleChange("social_twitter", e.target.value)}
              placeholder="https://twitter.com/vntv"
            />
          </div>

          <div>
            <Label htmlFor="social_instagram">Instagram</Label>
            <Input
              id="social_instagram"
              value={localSettings.social_instagram}
              onChange={(e) => handleChange("social_instagram", e.target.value)}
              placeholder="https://instagram.com/vntv"
            />
          </div>

          <div>
            <Label htmlFor="social_youtube">YouTube</Label>
            <Input
              id="social_youtube"
              value={localSettings.social_youtube}
              onChange={(e) => handleChange("social_youtube", e.target.value)}
              placeholder="https://youtube.com/@vntv"
            />
          </div>

          <div>
            <Label htmlFor="social_tiktok">TikTok</Label>
            <Input
              id="social_tiktok"
              value={localSettings.social_tiktok}
              onChange={(e) => handleChange("social_tiktok", e.target.value)}
              placeholder="https://tiktok.com/@vntv"
            />
          </div>

          <div>
            <Label htmlFor="social_linkedin">LinkedIn (Optional)</Label>
            <Input
              id="social_linkedin"
              value={localSettings.social_linkedin}
              onChange={(e) => handleChange("social_linkedin", e.target.value)}
              placeholder="https://linkedin.com/company/vntv"
            />
          </div>
        </div>
      </div>

      {/* Branding Assets */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Branding Assets</h3>
          <p className="text-sm text-text-tertiary">Logo and favicon (future: media picker)</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="logo_light">Logo (Light Theme)</Label>
            <Input
              id="logo_light"
              value={localSettings.logo_light}
              onChange={(e) => handleChange("logo_light", e.target.value)}
              placeholder="Media asset ID or URL"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Future: Media picker integration
            </p>
          </div>

          <div>
            <Label htmlFor="logo_dark">Logo (Dark Theme)</Label>
            <Input
              id="logo_dark"
              value={localSettings.logo_dark}
              onChange={(e) => handleChange("logo_dark", e.target.value)}
              placeholder="Media asset ID or URL"
            />
          </div>

          <div>
            <Label htmlFor="favicon">Favicon</Label>
            <Input
              id="favicon"
              value={localSettings.favicon}
              onChange={(e) => handleChange("favicon", e.target.value)}
              placeholder="Media asset ID or URL"
            />
          </div>

          <div>
            <Label htmlFor="og_image_default">Default Social Share Image</Label>
            <Input
              id="og_image_default"
              value={localSettings.og_image_default}
              onChange={(e) => handleChange("og_image_default", e.target.value)}
              placeholder="Media asset ID or URL (1200x630)"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <p className="text-sm text-text-tertiary">
          Changes will be applied immediately after saving
        </p>
        <Button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="min-w-32"
        >
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Status Messages */}
      {saveStatus === "success" && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
          Global settings saved successfully
        </div>
      )}

      {saveStatus === "error" && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {errorMessage || "Failed to save settings"}
        </div>
      )}
    </div>
  );
}
