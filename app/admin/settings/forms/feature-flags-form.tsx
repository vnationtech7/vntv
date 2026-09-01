"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui";
import { Save, Loader2, AlertTriangle } from "lucide-react";
import { FeatureFlagSettings, updateFeatureFlagSettings } from "@/app/actions/site-settings";

interface FeatureFlagsFormProps {
  settings: FeatureFlagSettings;
  onChange: (updates: Partial<FeatureFlagSettings>) => void;
  saveStatus: "idle" | "saving" | "success" | "error";
  errorMessage: string;
}

export function FeatureFlagsForm({ settings, onChange }: FeatureFlagsFormProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleToggle = (field: keyof FeatureFlagSettings, value: boolean) => {
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    onChange({ [field]: value });
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMessage("");

    try {
      const result = await updateFeatureFlagSettings(localSettings);

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

  const features = [
    {
      key: "feature_newsletter" as keyof FeatureFlagSettings,
      label: "Newsletter",
      description: "Enable newsletter signup forms and subscriber management",
      critical: false,
    },
    {
      key: "feature_breaking_news" as keyof FeatureFlagSettings,
      label: "Breaking News Ticker",
      description: "Show breaking news ticker at the top of pages",
      critical: false,
    },
    {
      key: "feature_comments" as keyof FeatureFlagSettings,
      label: "Comments",
      description: "Enable comments on articles (future feature)",
      critical: false,
    },
    {
      key: "feature_search" as keyof FeatureFlagSettings,
      label: "Search",
      description: "Enable search functionality across the site",
      critical: true,
    },
    {
      key: "feature_social_sharing" as keyof FeatureFlagSettings,
      label: "Social Sharing",
      description: "Show social sharing buttons on articles and videos",
      critical: false,
    },
    {
      key: "feature_trending" as keyof FeatureFlagSettings,
      label: "Trending Articles",
      description: "Display trending articles section on homepage and sidebars",
      critical: false,
    },
    {
      key: "feature_related_articles" as keyof FeatureFlagSettings,
      label: "Related Articles",
      description: "Show related articles suggestions at the end of articles",
      critical: false,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Warning Box */}
      <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Feature Flags Control
            </p>
            <p className="text-sm text-orange-600/80 dark:text-orange-400/80">
              These flags enable or disable major site features without code deployment. Disabling
              critical features (like Search) may significantly impact user experience. Test changes
              carefully.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Site Features</h3>
          <p className="text-sm text-text-tertiary">Enable or disable features site-wide</p>
        </div>

        <div className="space-y-3">
          {features.map((feature) => (
            <div
              key={feature.key}
              className={`
                rounded-lg border p-4
                ${
                  feature.critical
                    ? "border-orange-500/20 bg-orange-500/5"
                    : "border-border bg-background-panel-2"
                }
              `}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={feature.key} className="text-base font-medium">
                      {feature.label}
                    </Label>
                    {feature.critical && (
                      <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-tertiary">{feature.description}</p>
                </div>
                <Switch
                  id={feature.key}
                  checked={localSettings[feature.key]}
                  onCheckedChange={(checked) => handleToggle(feature.key, checked)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Status Summary */}
      <div className="rounded-lg border border-border bg-surface-primary p-4">
        <h4 className="mb-3 text-sm font-semibold text-text-primary">Active Features Summary</h4>
        <div className="flex flex-wrap gap-2">
          {features.map((feature) =>
            localSettings[feature.key] ? (
              <span
                key={feature.key}
                className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400"
              >
                {feature.label}
              </span>
            ) : null
          )}
        </div>
        {features.every((f) => !localSettings[f.key]) && (
          <p className="text-sm text-text-tertiary">No features enabled</p>
        )}
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
          Feature flags saved successfully
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
