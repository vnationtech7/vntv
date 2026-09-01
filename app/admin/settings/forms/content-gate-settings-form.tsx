"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui";
import { Save, Loader2, Info } from "lucide-react";
import { ContentGateSettings, updateContentGateSettings } from "@/app/actions/site-settings";

interface ContentGateSettingsFormProps {
  settings: ContentGateSettings;
  onChange: (updates: Partial<ContentGateSettings>) => void;
  saveStatus: "idle" | "saving" | "success" | "error";
  errorMessage: string;
}

export function ContentGateSettingsForm({
  settings,
  onChange,
}: ContentGateSettingsFormProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleToggle = (field: keyof ContentGateSettings, value: boolean) => {
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    onChange({ [field]: value });
  };

  const handleNumberChange = (field: keyof ContentGateSettings, value: string) => {
    const numValue = parseInt(value) || 0;
    const clamped = Math.max(0, Math.min(100, numValue));
    const updated = { ...localSettings, [field]: clamped };
    setLocalSettings(updated);
    onChange({ [field]: clamped });
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMessage("");

    try {
      const result = await updateContentGateSettings(localSettings);

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
      {/* Article Gate */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Article Access Gate</h3>
          <p className="text-sm text-text-tertiary">
            Control when anonymous users are prompted to sign in
          </p>
        </div>

        <div className="rounded-lg border border-border bg-background-panel-2 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="article_gate_enabled">Enable Article Gate</Label>
              <p className="text-sm text-text-tertiary">
                Prompt anonymous users to sign in when reading articles
              </p>
            </div>
            <Switch
              id="article_gate_enabled"
              checked={localSettings.anonymous_article_gate_enabled}
              onCheckedChange={(checked) =>
                handleToggle("anonymous_article_gate_enabled", checked)
              }
            />
          </div>

          {localSettings.anonymous_article_gate_enabled && (
            <div>
              <Label htmlFor="article_threshold">
                Article Threshold (%)
              </Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="article_threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={localSettings.article_gate_threshold}
                  onChange={(e) => handleNumberChange("article_gate_threshold", e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-text-tertiary">
                  {localSettings.article_gate_threshold}% of article shown before gate
                </span>
              </div>
              <p className="mt-1 text-xs text-text-tertiary">
                0 = immediate gate, 100 = gate at end of article
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Video Gate */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Video Access Gate</h3>
          <p className="text-sm text-text-tertiary">
            Control when anonymous users are prompted to sign in while watching videos
          </p>
        </div>

        <div className="rounded-lg border border-border bg-background-panel-2 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="video_gate_enabled">Enable Video Gate</Label>
              <p className="text-sm text-text-tertiary">
                Pause video and prompt sign in after threshold
              </p>
            </div>
            <Switch
              id="video_gate_enabled"
              checked={localSettings.anonymous_video_gate_enabled}
              onCheckedChange={(checked) =>
                handleToggle("anonymous_video_gate_enabled", checked)
              }
            />
          </div>

          {localSettings.anonymous_video_gate_enabled && (
            <div>
              <Label htmlFor="video_threshold">
                Video Threshold (%)
              </Label>
              <div className="mt-2 flex items-center gap-4">
                <Input
                  id="video_threshold"
                  type="number"
                  min="0"
                  max="100"
                  value={localSettings.video_gate_threshold}
                  onChange={(e) => handleNumberChange("video_gate_threshold", e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-text-tertiary">
                  Pause at {localSettings.video_gate_threshold}% of video duration
                </span>
              </div>
              <p className="mt-1 text-xs text-text-tertiary">
                Recommended: 25% (gives users a preview before requiring sign in)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Gate Behavior */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Gate Behavior</h3>
          <p className="text-sm text-text-tertiary">How the gate functions</p>
        </div>

        <div className="rounded-lg border border-border bg-background-panel-2 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="gate_redirect">Return to Content After Sign In</Label>
              <p className="text-sm text-text-tertiary">
                Redirect users back to the content they were viewing
              </p>
            </div>
            <Switch
              id="gate_redirect"
              checked={localSettings.gate_redirect_enabled}
              onCheckedChange={(checked) =>
                handleToggle("gate_redirect_enabled", checked)
              }
            />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Content Gates Strategy
            </p>
            <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
              Gates help convert anonymous visitors into registered users. For best results:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-blue-600/80 dark:text-blue-400/80">
              <li>Articles: Start with 0% (immediate gate) or 25% (preview first)</li>
              <li>Videos: 25% threshold gives a good preview while encouraging sign-up</li>
              <li>Monitor conversion rates and adjust thresholds accordingly</li>
              <li>Authenticated users never see gates</li>
            </ul>
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
          Content gate settings saved successfully
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
