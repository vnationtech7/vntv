"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequireRole } from "@/components/auth/require-role-client";
import { createSponsorship } from "@/app/actions/sponsorships";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewSponsorPage() {
  return (
    <RequireRole allowedRoles={["super_admin", "advertising_manager"]}>
      <NewSponsorPageContent />
    </RequireRole>
  );
}

function NewSponsorPageContent() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website_url: "",
    is_active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a sponsor name");
      return;
    }

    setSaving(true);

    const { data, error } = await createSponsorship({
      name: formData.name,
      description: formData.description || null,
      website_url: formData.website_url || null,
      is_active: formData.is_active,
    });

    if (error) {
      alert(error);
      setSaving(false);
    } else {
      router.push("/admin/sponsors");
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="New Sponsor"
        description="Add a new sponsorship partner"
      >
        <Link href="/admin/sponsors">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sponsors
          </Button>
        </Link>
      </PageHeader>

      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-surface-secondary rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Sponsor Information
            </h3>

            {/* Name */}
            <div>
              <Label htmlFor="name">
                Sponsor Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Acme Corporation"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the sponsor..."
                rows={4}
              />
            </div>

            {/* Website URL */}
            <div>
              <Label htmlFor="website_url">Website URL (Optional)</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) =>
                  setFormData({ ...formData, website_url: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active (sponsor is available for selection)
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Creating..." : "Create Sponsor"}
            </Button>
            <Link href="/admin/sponsors">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
