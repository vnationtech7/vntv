"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { AllSettings } from "@/app/actions/site-settings";
import { GlobalSettingsForm } from "./forms/global-settings-form";
import { ContentGateSettingsForm } from "./forms/content-gate-settings-form";
import { FeatureFlagsForm } from "./forms/feature-flags-form";
import { SEOSettingsForm } from "./forms/seo-settings-form";
import { EmailSettingsForm } from "./forms/email-settings-form";

interface SettingsClientProps {
  initialSettings: AllSettings;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<AllSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState("global");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const tabs = [
    {
      value: "global",
      label: "Global Settings",
      description: "Site identity, contact info, and social media",
    },
    {
      value: "content-gate",
      label: "Content Gates",
      description: "Anonymous user access controls",
    },
    {
      value: "features",
      label: "Feature Flags",
      description: "Enable/disable site features",
    },
    {
      value: "seo",
      label: "SEO & Analytics",
      description: "Search optimization and tracking",
    },
    {
      value: "email",
      label: "Email & Newsletter",
      description: "Email service and newsletter configuration",
    },
  ];

  const handleSettingsUpdate = (category: keyof AllSettings, updates: any) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...updates,
      },
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "global":
        return (
          <GlobalSettingsForm
            settings={settings.global}
            onChange={(updates) => handleSettingsUpdate("global", updates)}
            saveStatus={saveStatus}
            errorMessage={errorMessage}
          />
        );
      case "content-gate":
        return (
          <ContentGateSettingsForm
            settings={settings.contentGate}
            onChange={(updates) => handleSettingsUpdate("contentGate", updates)}
            saveStatus={saveStatus}
            errorMessage={errorMessage}
          />
        );
      case "features":
        return (
          <FeatureFlagsForm
            settings={settings.features}
            onChange={(updates) => handleSettingsUpdate("features", updates)}
            saveStatus={saveStatus}
            errorMessage={errorMessage}
          />
        );
      case "seo":
        return (
          <SEOSettingsForm
            settings={settings.seo}
            onChange={(updates) => handleSettingsUpdate("seo", updates)}
            saveStatus={saveStatus}
            errorMessage={errorMessage}
          />
        );
      case "email":
        return (
          <EmailSettingsForm
            settings={settings.email}
            onChange={(updates) => handleSettingsUpdate("email", updates)}
            saveStatus={saveStatus}
            errorMessage={errorMessage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Status Banner */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" />
          <p className="text-sm font-medium">Settings saved successfully</p>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{errorMessage || "Failed to save settings"}</p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="rounded-lg border border-border bg-surface-primary">
        <div className="border-b border-border p-1">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setSaveStatus("idle");
                  setErrorMessage("");
                }}
                className={`
                  flex-shrink-0 rounded-md px-4 py-2.5 text-sm font-medium transition-colors
                  ${
                    activeTab === tab.value
                      ? "bg-vntv-red/10 text-vntv-red"
                      : "text-text-secondary hover:bg-background-panel-2 hover:text-text-primary"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Description */}
        <div className="border-b border-border bg-background-panel-2 px-6 py-3">
          <p className="text-sm text-text-tertiary">
            {tabs.find((tab) => tab.value === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="p-6">{renderTabContent()}</div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg border border-border bg-surface-primary p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-text-tertiary" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-text-primary">About Settings</p>
            <p className="text-sm text-text-tertiary">
              Changes to settings are applied immediately after saving. Some settings may require
              users to refresh their browser to see changes. Sensitive settings like API keys
              should be managed through environment variables in production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
