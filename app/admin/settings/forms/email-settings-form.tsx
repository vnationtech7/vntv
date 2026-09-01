"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui";
import { Save, Loader2, AlertTriangle, ExternalLink } from "lucide-react";
import { EmailSettings, updateEmailSettings } from "@/app/actions/site-settings";

interface EmailSettingsFormProps {
  settings: EmailSettings;
  onChange: (updates: Partial<EmailSettings>) => void;
  saveStatus: "idle" | "saving" | "success" | "error";
  errorMessage: string;
}

export function EmailSettingsForm({ settings, onChange }: EmailSettingsFormProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field: keyof EmailSettings, value: string | boolean) => {
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    onChange({ [field]: value });
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMessage("");

    try {
      const result = await updateEmailSettings(localSettings);

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
      {/* Security Warning */}
      <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
              API Key Security
            </p>
            <p className="text-sm text-orange-600/80 dark:text-orange-400/80">
              For production, store API keys in environment variables (RESEND_API_KEY) instead of
              the database. Database storage is for development/testing only.
            </p>
          </div>
        </div>
      </div>

      {/* Email Provider */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Email Configuration</h3>
          <p className="text-sm text-text-tertiary">Basic email sender information</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="email_from_address">From Email Address</Label>
            <Input
              id="email_from_address"
              type="email"
              value={localSettings.email_from_address}
              onChange={(e) => handleChange("email_from_address", e.target.value)}
              placeholder="noreply@vntv.africa"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Email address that appears as sender
            </p>
          </div>

          <div>
            <Label htmlFor="email_from_name">From Name</Label>
            <Input
              id="email_from_name"
              value={localSettings.email_from_name}
              onChange={(e) => handleChange("email_from_name", e.target.value)}
              placeholder="VNTV"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Friendly name shown in email clients
            </p>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="email_reply_to">Reply-To Address</Label>
            <Input
              id="email_reply_to"
              type="email"
              value={localSettings.email_reply_to}
              onChange={(e) => handleChange("email_reply_to", e.target.value)}
              placeholder="info@vntv.africa"
            />
            <p className="mt-1 text-xs text-text-tertiary">
              Where replies to automated emails go
            </p>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="email_provider">Email Service Provider</Label>
            <select
              id="email_provider"
              value={localSettings.email_provider}
              onChange={(e) => handleChange("email_provider", e.target.value)}
              className="w-full rounded-lg border border-border bg-background-panel px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
            >
              <option value="resend">Resend (Recommended)</option>
              <option value="sendgrid">SendGrid</option>
              <option value="ses">Amazon SES</option>
              <option value="smtp">Custom SMTP</option>
            </select>
            <p className="mt-1 text-xs text-text-tertiary">
              Currently configured for Resend
            </p>
          </div>
        </div>
      </div>

      {/* Resend Configuration */}
      {localSettings.email_provider === "resend" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Resend Configuration</h3>
            <p className="text-sm text-text-tertiary">
              Resend API credentials •{" "}
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-vntv-red hover:underline inline-flex items-center gap-1"
              >
                Get API Key
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="resend_api_key">Resend API Key</Label>
              <Input
                id="resend_api_key"
                type="password"
                value={localSettings.resend_api_key}
                onChange={(e) => handleChange("resend_api_key", e.target.value)}
                placeholder="re_xxxxxxxxxxxxxxxxxxxx"
              />
              <p className="mt-1 text-xs text-text-tertiary">
                ⚠️ Production: Use RESEND_API_KEY environment variable instead
              </p>
            </div>

            <div>
              <Label htmlFor="resend_audience_id">Resend Audience ID (Optional)</Label>
              <Input
                id="resend_audience_id"
                value={localSettings.resend_audience_id}
                onChange={(e) => handleChange("resend_audience_id", e.target.value)}
                placeholder="aud_xxxxxxxxxxxxxxxxxxxx"
              />
              <p className="mt-1 text-xs text-text-tertiary">
                For managing newsletter subscribers via Resend
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Settings */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Newsletter Settings</h3>
          <p className="text-sm text-text-tertiary">Configure newsletter behavior</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-background-panel-2 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="newsletter_enabled">Enable Newsletter</Label>
                <p className="text-sm text-text-tertiary">
                  Show newsletter signup forms on the site
                </p>
              </div>
              <Switch
                id="newsletter_enabled"
                checked={localSettings.newsletter_enabled}
                onCheckedChange={(checked) => handleChange("newsletter_enabled", checked)}
              />
            </div>
          </div>

          {localSettings.newsletter_enabled && (
            <>
              <div className="rounded-lg border border-border bg-background-panel-2 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newsletter_double_optin">Double Opt-In</Label>
                    <p className="text-sm text-text-tertiary">
                      Require email verification before activating subscription
                    </p>
                  </div>
                  <Switch
                    id="newsletter_double_optin"
                    checked={localSettings.newsletter_double_optin}
                    onCheckedChange={(checked) => handleChange("newsletter_double_optin", checked)}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background-panel-2 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newsletter_welcome_enabled">Welcome Email</Label>
                    <p className="text-sm text-text-tertiary">
                      Send welcome email to new subscribers
                    </p>
                  </div>
                  <Switch
                    id="newsletter_welcome_enabled"
                    checked={localSettings.newsletter_welcome_enabled}
                    onCheckedChange={(checked) =>
                      handleChange("newsletter_welcome_enabled", checked)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="newsletter_frequency">Newsletter Frequency</Label>
                <select
                  id="newsletter_frequency"
                  value={localSettings.newsletter_frequency}
                  onChange={(e) => handleChange("newsletter_frequency", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background-panel px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-yellow"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <p className="mt-1 text-xs text-text-tertiary">
                  How often newsletters are sent to subscribers
                </p>
              </div>
            </>
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
          Email settings saved successfully
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
