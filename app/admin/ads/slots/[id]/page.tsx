"use client";

import { use, useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequireRole } from "@/components/auth/require-role-client";
import {
  getAdSlot,
  updateAdSlot,
  type AdSlot,
} from "@/app/actions/ad-slots";
import { AD_PLACEMENTS } from "@/lib/constants/ad-placements";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditAdSlotPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  
  return (
    <RequireRole allowedRoles={["super_admin", "advertising_manager"]}>
      <EditAdSlotPageContent id={id} />
    </RequireRole>
  );
}

function EditAdSlotPageContent({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [slot, setSlot] = useState<AdSlot | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    placement: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    const loadSlot = async () => {
      const { data } = await getAdSlot(id);
      if (data) {
        setSlot(data);
        setFormData({
          name: data.name,
          key: data.key,
          placement: data.placement,
          description: data.description || "",
          is_active: data.is_active,
        });
      }
      setLoading(false);
    };

    loadSlot();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.key || !formData.placement) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);

    const { data, error } = await updateAdSlot(id, formData);

    if (error) {
      alert(error);
      setSaving(false);
    } else {
      router.push("/admin/ads/slots");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-text-tertiary">Loading ad slot...</div>
      </AdminLayout>
    );
  }

  if (!slot) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-text-tertiary mb-4">Ad slot not found</p>
          <Link href="/admin/ads/slots">
            <Button variant="outline">Back to Slots</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader title="Edit Ad Slot" description={`Editing: ${slot.name}`}>
        <Link href="/admin/ads/slots">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Slots
          </Button>
        </Link>
      </PageHeader>

      <div className="p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-surface-secondary rounded-lg p-6 space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name">
                Slot Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Homepage Top Banner"
                required
              />
              <p className="text-xs text-text-tertiary mt-1">
                A descriptive name for this ad slot
              </p>
            </div>

            {/* Key */}
            <div>
              <Label htmlFor="key">
                Slot Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) =>
                  setFormData({ ...formData, key: e.target.value })
                }
                placeholder="homepage_top_banner"
                required
              />
              <p className="text-xs text-text-tertiary mt-1">
                Unique identifier for this slot (lowercase with underscores)
              </p>
            </div>

            {/* Placement */}
            <div>
              <Label htmlFor="placement">
                Placement <span className="text-red-500">*</span>
              </Label>
              <select
                id="placement"
                value={formData.placement}
                onChange={(e) =>
                  setFormData({ ...formData, placement: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a placement</option>
                {AD_PLACEMENTS.map((placement) => (
                  <option key={placement.value} value={placement.value}>
                    {placement.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-text-tertiary mt-1">
                Where this ad slot appears on the site
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description or notes about this ad slot..."
                rows={3}
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
                Active (slot is available for ads)
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Link href="/admin/ads/slots">
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
