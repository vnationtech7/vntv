import { Suspense } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { requireSuperAdmin } from "@/lib/auth/server-authorization";
import { SettingsClient } from "./settings-client";
import { getAllSettings } from "@/app/actions/site-settings";
import { Settings } from "lucide-react";

export const metadata = {
  title: "Site Settings | VNTV CMS",
  description: "Configure site-wide settings",
};

export default async function SettingsPage() {
  // Require super admin access
  await requireSuperAdmin();

  // Fetch all settings
  const settingsResult = await getAllSettings();
  const settings = settingsResult.success ? settingsResult.data : null;

  return (
    <AdminLayout>
      <PageHeader
        title="Site Settings"
        description="Configure site-wide settings without code deployment"
      />

      <Suspense fallback={<div className="text-text-secondary">Loading settings...</div>}>
        {settings ? (
          <SettingsClient initialSettings={settings} />
        ) : (
          <div className="rounded-lg border border-border bg-surface-primary p-6">
            <p className="text-text-secondary">
              Failed to load settings. Please try refreshing the page.
            </p>
          </div>
        )}
      </Suspense>
    </AdminLayout>
  );
}
