"use client";

import { use, useState, useEffect } from "react";
import { AdminLayout } from "@/components/cms/admin-layout";
import { PageHeader } from "@/components/cms/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdImageUpload } from "@/components/cms/ad-image-upload";
import { getPlacementDetails } from "@/lib/constants/ad-placements";
import { RequireRole } from "@/components/auth/require-role-client";
import {
  getAdvertisement,
  updateAdvertisement,
  type Advertisement,
} from "@/app/actions/advertisements";
import { getAdSlots, type AdSlot } from "@/app/actions/ad-slots";
import { getSponsorships, type Sponsorship } from "@/app/actions/sponsorships";
import { ArrowLeft, Save, Image as ImageIcon, Code } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditAdvertisementPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  
  return (
    <RequireRole allowedRoles={["super_admin", "advertising_manager"]}>
      <EditAdvertisementPageContent id={id} />
    </RequireRole>
  );
}

function EditAdvertisementPageContent({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [sponsors, setSponsors] = useState<Sponsorship[]>([]);
  const [formData, setFormData] = useState({
    slot_id: "",
    name: "",
    creative_type: "image" as "image" | "html",
    image_path: "" as string,
    image_width: null as number | null,
    image_height: null as number | null,
    html_content: "",
    target_url: "",
    sponsor_id: null as string | null,
    starts_at: "",
    expires_at: "",
    priority: 5,
    is_active: true,
  });

  useEffect(() => {
    const loadData = async () => {
      const [adResult, slotsResult, sponsorsResult] = await Promise.all([
        getAdvertisement(id),
        getAdSlots(true), // Include inactive slots in dropdown
        getSponsorships(),
      ]);

      if (adResult.data) {
        const ad = adResult.data;
        setAd(ad);
        setFormData({
          slot_id: ad.slot_id,
          name: ad.name,
          creative_type: ad.creative_type,
          image_path: ad.image_path || "",
          image_width: ad.image_width,
          image_height: ad.image_height,
          html_content: ad.html_content || "",
          target_url: ad.target_url || "",
          sponsor_id: ad.sponsor_id,
          starts_at: ad.starts_at.slice(0, 16),
          expires_at: ad.expires_at ? ad.expires_at.slice(0, 16) : "",
          priority: ad.priority,
          is_active: ad.is_active,
        });
      }

      if (slotsResult.data) setSlots(slotsResult.data);
      if (sponsorsResult.data) setSponsors(sponsorsResult.data);

      setLoading(false);
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slot_id) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.creative_type === "image" && !formData.image_path) {
      alert("Please upload an image for this advertisement");
      return;
    }

    if (formData.creative_type === "html" && !formData.html_content.trim()) {
      alert("Please provide HTML content for this advertisement");
      return;
    }

    setSaving(true);

    const { data, error } = await updateAdvertisement(id, {
      slot_id: formData.slot_id,
      name: formData.name,
      creative_type: formData.creative_type,
      image_path: formData.image_path || null,
      image_width: formData.image_width,
      image_height: formData.image_height,
      html_content: formData.html_content || null,
      target_url: formData.target_url || null,
      sponsor_id: formData.sponsor_id || null,
      starts_at: formData.starts_at,
      expires_at: formData.expires_at || null,
      priority: formData.priority,
      is_active: formData.is_active,
    });

    if (error) {
      alert(error);
      setSaving(false);
    } else {
      router.push("/admin/ads");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-text-tertiary">Loading advertisement...</div>
      </AdminLayout>
    );
  }

  if (!ad) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-text-tertiary mb-4">Advertisement not found</p>
          <Link href="/admin/ads">
            <Button variant="outline">Back to Ads</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageHeader title="Edit Advertisement" description={`Editing: ${ad.name}`}>
        <Link href="/admin/ads">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Ads
          </Button>
        </Link>
      </PageHeader>

      <div className="p-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-surface-secondary rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-text-primary">Basic Information</h3>

            {/* Name */}
            <div>
              <Label htmlFor="name">
                Advertisement Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Summer Sale Banner"
                required
              />
            </div>

            {/* Ad Slot */}
            <div>
              <Label htmlFor="slot_id">
                Ad Slot <span className="text-red-500">*</span>
              </Label>
              <select
                id="slot_id"
                value={formData.slot_id}
                onChange={(e) => setFormData({ ...formData, slot_id: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select an ad slot</option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.name} ({slot.placement})
                  </option>
                ))}
              </select>
            </div>

            {/* Sponsor */}
            <div>
              <Label htmlFor="sponsor_id">Sponsor (Optional)</Label>
              <select
                id="sponsor_id"
                value={formData.sponsor_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sponsor_id: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">No sponsor</option>
                {sponsors.map((sponsor) => (
                  <option key={sponsor.id} value={sponsor.id}>
                    {sponsor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-surface-secondary rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-text-primary">Creative Content</h3>

            {/* Creative Type */}
            <div>
              <Label>Creative Type <span className="text-red-500">*</span></Label>
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, creative_type: "image", html_content: "", image_path: "", image_width: null, image_height: null })
                  }
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    formData.creative_type === "image"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <ImageIcon className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">Image</div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, creative_type: "html", image_path: "", image_width: null, image_height: null })
                  }
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    formData.creative_type === "html"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Code className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-medium">HTML</div>
                </button>
              </div>
            </div>

            {/* Image Upload */}
            {formData.creative_type === "image" && formData.slot_id && (
              <AdImageUpload
                slotKey={slots.find(s => s.id === formData.slot_id)?.key || ""}
                requiredWidth={getPlacementDetails(slots.find(s => s.id === formData.slot_id)?.placement || "")?.width || 1200}
                requiredHeight={getPlacementDetails(slots.find(s => s.id === formData.slot_id)?.placement || "")?.height || 225}
                ratio={getPlacementDetails(slots.find(s => s.id === formData.slot_id)?.placement || "")?.ratio || "16:3"}
                onUploadSuccess={(data) => {
                  setFormData({
                    ...formData,
                    image_path: data.path,
                    image_width: data.width,
                    image_height: data.height,
                  });
                }}
                currentImageUrl={formData.image_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/advertisements/${formData.image_path}` : null}
                onRemove={() => {
                  setFormData({
                    ...formData,
                    image_path: "",
                    image_width: null,
                    image_height: null,
                  });
                }}
              />
            )}
            
            {formData.creative_type === "image" && !formData.slot_id && (
              <div className="p-4 bg-surface-tertiary rounded-lg text-sm text-text-tertiary">
                Please select an ad slot first to upload an image
              </div>
            )}

            {/* HTML Content */}
            {formData.creative_type === "html" && (
              <div>
                <Label htmlFor="html_content">
                  HTML Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="html_content"
                  value={formData.html_content}
                  onChange={(e) =>
                    setFormData({ ...formData, html_content: e.target.value })
                  }
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {/* Target URL */}
            <div>
              <Label htmlFor="target_url">Target URL (Optional)</Label>
              <Input
                id="target_url"
                type="url"
                value={formData.target_url}
                onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                placeholder="https://example.com/landing-page"
              />
            </div>
          </div>

          <div className="bg-surface-secondary rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-semibold text-text-primary">Scheduling & Priority</h3>

            {/* Start Date */}
            <div>
              <Label htmlFor="starts_at">
                Start Date & Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="starts_at"
                type="datetime-local"
                value={formData.starts_at}
                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                required
              />
            </div>

            {/* End Date */}
            <div>
              <Label htmlFor="expires_at">End Date & Time (Optional)</Label>
              <Input
                id="expires_at"
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="100"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })
                }
                required
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
                Active (ad is ready to be displayed)
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Link href="/admin/ads">
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
