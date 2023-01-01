"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequireRole } from "@/components/auth/require-role-client";
import {
  getGoogleAdSenseConfig,
  getAdsGlobalSettings,
  updateGoogleAdSenseConfig,
  updateAdsGlobalSettings,
  type GoogleAdSenseConfig,
  type AdsGlobalSettings,
} from "@/app/actions/site-settings";
import { Save, AlertCircle } from "lucide-react";

export default function AdSettingsPage() {
  return (
    <RequireRole allowedRoles={["super_admin"]}>
      <AdSettingsPageContent />
    </RequireRole>
  );
}

function AdSettingsPageContent() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adSenseConfig, setAdSenseConfig] = useState<GoogleAdSenseConfig>({
    enabled: false,
    publisher_id: "",
    ad_client: "",
    auto_ads_enabled: false,
    slots: {
      homepage_top: "",
      homepage_sidebar: "",
      article_top: "",
      article_sidebar: "",
      article_inline: "",
    },
  });
  const [globalSettings, setGlobalSettings] = useState<AdsGlobalSettings>({
    custom_ads_enabled: true,
    adsense_fallback_enabled: true,
    show_ad_label: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const [adSenseResult, settingsResult] = await Promise.all([
        getGoogleAdSenseConfig(),
        getAdsGlobalSettings(),
      ]);

      if (adSenseResult.data) {
        setAdSenseConfig(adSenseResult.data);
      }

      if (settingsResult.data) {
        setGlobalSettings(settingsResult.data);
      }

      setLoading(false);
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    const [adSenseResult, settingsResult] = await Promise.all([
      updateGoogleAdSenseConfig(adSenseConfig),
      updateAdsGlobalSettings(globalSettings),
    ]);

    if (adSenseResult.error || settingsResult.error) {
      alert(
        `Error saving settings: ${adSenseResult.error || settingsResult.error}`
      );
    } else {
      alert("Settings saved successfully!");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-text-tertiary">
          Loading settings...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Advertising Settings"
        description="Configure Google AdSense and global advertising preferences"
      />

      <div className="p-6 max-w-4xl space-y-6">
        {/* Global Settings */}
        <div className="bg-surface-secondary rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Global Advertising Settings
            </h2>
            <p className="text-sm text-text-tertiary">
              Control how advertisements are displayed across your site
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="custom_ads_enabled"
                checked={globalSettings.custom_ads_enabled}
                onChange={(e) =>
                  setGlobalSettings({
                    ...globalSettings,
                    custom_ads_enabled: e.target.checked,
                  })
                }
                className="w-4 h-4 mt-1 rounded border-border text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <Label htmlFor="custom_ads_enabled" className="cursor-pointer">
                  Enable Custom Ads
                </Label>
                <p className="text-xs text-text-tertiary mt-1">
                  Show custom advertisements created in the Advertisements section
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="adsense_fallback_enabled"
                checked={globalSettings.adsense_fallback_enabled}
                onChange={(e) =>
                  setGlobalSettings({
                    ...globalSettings,
                    adsense_fallback_enabled: e.target.checked,
                  })
                }
                className="w-4 h-4 mt-1 rounded border-border text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <Label
                  htmlFor="adsense_fallback_enabled"
                  className="cursor-pointer"
                >
                  Enable AdSense Fallback
                </Label>
                <p className="text-xs text-text-tertiary mt-1">
                  Show Google AdSense ads when no custom ads are available
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="show_ad_label"
                checked={globalSettings.show_ad_label}
                onChange={(e) =>
                  setGlobalSettings({
                    ...globalSettings,
                    show_ad_label: e.target.checked,
                  })
                }
                className="w-4 h-4 mt-1 rounded border-border text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <Label htmlFor="show_ad_label" className="cursor-pointer">
                  Show "Advertisement" Label
                </Label>
                <p className="text-xs text-text-tertiary mt-1">
                  Display "Advertisement" text below ads for transparency
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Google AdSense Settings */}
        <div className="bg-surface-secondary rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Google AdSense Configuration
            </h2>
            <p className="text-sm text-text-tertiary">
              Configure Google AdSense to monetize your content
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-400">
              <strong>Note:</strong> AdSense ads will only display when no custom
              ads are available for a slot, and "Enable AdSense Fallback" is
              enabled above.
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="adsense_enabled"
                checked={adSenseConfig.enabled}
                onChange={(e) =>
                  setAdSenseConfig({
                    ...adSenseConfig,
                    enabled: e.target.checked,
                  })
                }
                className="w-4 h-4 mt-1 rounded border-border text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <Label htmlFor="adsense_enabled" className="cursor-pointer">
                  Enable Google AdSense
                </Label>
                <p className="text-xs text-text-tertiary mt-1">
                  Turn on AdSense integration for your site
                </p>
              </div>
            </div>

            {adSenseConfig.enabled && (
              <>
                <div>
                  <Label htmlFor="publisher_id">Publisher ID</Label>
                  <Input
                    id="publisher_id"
                    value={adSenseConfig.publisher_id}
                    onChange={(e) =>
                      setAdSenseConfig({
                        ...adSenseConfig,
                        publisher_id: e.target.value,
                      })
                    }
                    placeholder="pub-1234567890123456"
                  />
                  <p className="text-xs text-text-tertiary mt-1">
                    Your AdSense publisher ID (found in your AdSense dashboard)
                  </p>
                </div>

                <div>
                  <Label htmlFor="ad_client">Ad Client</Label>
                  <Input
                    id="ad_client"
                    value={adSenseConfig.ad_client}
                    onChange={(e) =>
                      setAdSenseConfig({
                        ...adSenseConfig,
                        ad_client: e.target.value,
                      })
                    }
                    placeholder="ca-pub-1234567890123456"
                  />
                  <p className="text-xs text-text-tertiary mt-1">
                    Your AdSense client ID (starts with ca-pub-)
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="font-medium text-text-primary mb-3">
                    Ad Slot IDs
                  </h3>
                  <p className="text-xs text-text-tertiary mb-4">
                    Enter your AdSense ad slot IDs for each placement. Leave
                    empty to skip that placement.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slot_homepage_top">Homepage Top</Label>
                      <Input
                        id="slot_homepage_top"
                        value={adSenseConfig.slots.homepage_top}
                        onChange={(e) =>
                          setAdSenseConfig({
                            ...adSenseConfig,
                            slots: {
                              ...adSenseConfig.slots,
                              homepage_top: e.target.value,
                            },
                          })
                        }
                        placeholder="1234567890"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slot_homepage_sidebar">
                        Homepage Sidebar
                      </Label>
                      <Input
                        id="slot_homepage_sidebar"
                        value={adSenseConfig.slots.homepage_sidebar}
                        onChange={(e) =>
                          setAdSenseConfig({
                            ...adSenseConfig,
                            slots: {
                              ...adSenseConfig.slots,
                              homepage_sidebar: e.target.value,
                            },
                          })
                        }
                        placeholder="1234567890"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slot_article_top">Article Top</Label>
                      <Input
                        id="slot_article_top"
                        value={adSenseConfig.slots.article_top}
                        onChange={(e) =>
                          setAdSenseConfig({
                            ...adSenseConfig,
                            slots: {
                              ...adSenseConfig.slots,
                              article_top: e.target.value,
                            },
                          })
                        }
                        placeholder="1234567890"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slot_article_sidebar">
                        Article Sidebar
                      </Label>
                      <Input
                        id="slot_article_sidebar"
                        value={adSenseConfig.slots.article_sidebar}
                        onChange={(e) =>
                          setAdSenseConfig({
                            ...adSenseConfig,
                            slots: {
                              ...adSenseConfig.slots,
                              article_sidebar: e.target.value,
                            },
                          })
                        }
                        placeholder="1234567890"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slot_article_inline">Article Inline</Label>
                      <Input
                        id="slot_article_inline"
                        value={adSenseConfig.slots.article_inline}
                        onChange={(e) =>
                          setAdSenseConfig({
                            ...adSenseConfig,
                            slots: {
                              ...adSenseConfig.slots,
                              article_inline: e.target.value,
                            },
                          })
                        }
                        placeholder="1234567890"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
