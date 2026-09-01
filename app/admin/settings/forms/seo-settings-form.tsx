"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui";
import { Save, Loader2, ExternalLink } from "lucide-react";
import { SEOSettings, updateSEOSettings } from "@/app/actions/site-settings";

interface SEOSettingsFormProps {
  settings: SEOSettings;
  onChange: (updates: Partial<SEOSettings>) => void;
  saveStatus: "idle" | "saving" | "success" | "error";
  errorMessage: string;
}

export function SEOSettingsForm({ settings, onChange }: SEOSettingsFormProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field: keyof SEOSettings, value: string | boolean | number) => {
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    onChange({ [field]: value });
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMessage("");

    try {
      const result = await updateSEOSettings(localSettings);

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
      {/* Meta Defaults */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Meta Defaults</h3>
          <p className="text-sm text-text-tertiary">
            Fallback values when page-specific meta tags are not set
          </p>
        </div>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="seo_default_meta_description">Default Meta Description</Label>
            <Textarea
              id="seo_default_meta_description"
              value={localSettings.seo_default_meta_description}
              onChange={(e) => handleChange("seo_default_meta_description", e.target.value)}
              placeholder="Your trusted source for African news and stories..."
              rows={3}
            />
            <p className="mt-1 text-xs text-text-tertiary">
              160 characters recommended for search results
            </p>
          </div>

          <div>
            <Label htmlFor="seo_keywords">Default Keywords</Label>
            <Input
              id="seo_keywords"
              value={localSettings.seo_keywords}
              onChange={(e) => handleChange("seo_keywords", e.target.value)}
              placeholder="African news, Ghana news, Nigeria news, VNTV"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Comma-separated keywords (optional, modern SEO doesn't heavily rely on this)
            </p>
          </div>
        </div>
      </div>

      {/* Google Analytics */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Google Analytics</h3>
          <p className="text-sm text-text-tertiary">Track site traffic and user behavior</p>
        </div>

        <div>
          <Label htmlFor="seo_google_analytics_id">Google Analytics Measurement ID</Label>
          <Input
            id="seo_google_analytics_id"
            value={localSettings.seo_google_analytics_id}
            onChange={(e) => handleChange("seo_google_analytics_id", e.target.value)}
            placeholder="G-XXXXXXXXXX"
          />
          <p className="mt-1 text-xs text-text-tertiary">
            Format: G-XXXXXXXXXX (GA4) •{" "}
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-vntv-red hover:underline inline-flex items-center gap-1"
            >
              Get Analytics ID
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>

      {/* Google Search Console */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Google Search Console</h3>
          <p className="text-sm text-text-tertiary">Verify site ownership with Google</p>
        </div>

        <div className="grid gap-4">
          <div>
            <Label htmlFor="seo_google_search_console">Search Console Verification Code</Label>
            <Input
              id="seo_google_search_console"
              value={localSettings.seo_google_search_console}
              onChange={(e) => handleChange("seo_google_search_console", e.target.value)}
              placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Meta tag content value only (not the full tag) •{" "}
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="text-vntv-red hover:underline inline-flex items-center gap-1"
              >
                Search Console
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div>
            <Label htmlFor="seo_google_site_verification">
              Google Site Verification (Alternative)
            </Label>
            <Input
              id="seo_google_site_verification"
              value={localSettings.seo_google_site_verification}
              onChange={(e) => handleChange("seo_google_site_verification", e.target.value)}
              placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Alternative verification method (optional)
            </p>
          </div>
        </div>
      </div>

      {/* Indexing & Sitemap */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Indexing & Sitemap</h3>
          <p className="text-sm text-text-tertiary">Control how search engines index your site</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-background-panel-2 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="seo_robots_index">Allow Search Engine Indexing</Label>
                <p className="text-sm text-text-tertiary">
                  Let search engines index and display your content
                </p>
              </div>
              <Switch
                id="seo_robots_index"
                checked={localSettings.seo_robots_index}
                onCheckedChange={(checked) => handleChange("seo_robots_index", checked)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background-panel-2 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="seo_sitemap_enabled">Enable Automatic Sitemap</Label>
                <p className="text-sm text-text-tertiary">
                  Generate sitemap.xml automatically for search engines
                </p>
              </div>
              <Switch
                id="seo_sitemap_enabled"
                checked={localSettings.seo_sitemap_enabled}
                onCheckedChange={(checked) => handleChange("seo_sitemap_enabled", checked)}
              />
            </div>
          </div>

          {localSettings.seo_sitemap_enabled && (
            <div>
              <Label htmlFor="seo_sitemap_max_articles">Maximum Articles in Sitemap</Label>
              <Input
                id="seo_sitemap_max_articles"
                type="number"
                min="100"
                max="50000"
                value={localSettings.seo_sitemap_max_articles}
                onChange={(e) =>
                  handleChange("seo_sitemap_max_articles", parseInt(e.target.value) || 1000)
                }
                className="w-32"
              />
              <p className="mt-1 text-xs text-text-tertiary">
                Recommended: 1000-5000 (Google limit is 50,000 URLs per sitemap)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between border-t border-border pt-6">
        <p className="text-sm text-text-tertiary">
          Changes will be applied immediately after saving
        </p>
        <Button onClick={handleSave} disabled={saveStatus === "saving"} className="min-w-32">
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
          SEO settings saved successfully
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
