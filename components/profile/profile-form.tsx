"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import { updateProfile, uploadAvatar, deleteAvatar } from "@/app/profile/actions";
import { User, Mail, ImageIcon, Trash2 } from "@/components/icons";
import type { Database } from "@/types/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);

  // Function to trigger file input click
  const triggerFileInput = () => {
    const fileInput = document.getElementById("avatar-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const newsletterEnabled = formData.get("newsletter") === "on";

    // Update profile
    // @ts-ignore - Database schema types
    const result = await updateProfile({
      full_name: formData.get("fullName") as string,
      newsletter_subscribed: newsletterEnabled,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Sync newsletter subscription with newsletter_subscribers table
    try {
      const response = await fetch("/api/sync-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile.email,
          enabled: newsletterEnabled,
        }),
      });

      const syncResult = await response.json();
      
      if (!syncResult.success) {
        console.error("Newsletter sync error:", syncResult.error);
        // Don't show error to user - profile update succeeded
      }
    } catch (err) {
      console.error("Newsletter sync failed:", err);
      // Don't show error to user - profile update succeeded
    }

    setSuccess("Profile updated successfully");
    setLoading(false);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("avatar", file);

    const result = await uploadAvatar(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setAvatarUrl(result.data?.url || null);
      setSuccess("Avatar updated successfully");
    }

    setUploading(false);
  }

  async function handleDeleteAvatar() {
    if (!confirm("Are you sure you want to delete your avatar?")) return;

    setUploading(true);
    setError(null);

    const result = await deleteAvatar();

    if (result.error) {
      setError(result.error);
    } else {
      setAvatarUrl(null);
      setSuccess("Avatar deleted successfully");
    }

    setUploading(false);
  }

  const themeOptions = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Profile Picture</h2>
        <div className="flex items-center gap-4">
          <Avatar size="xl">
            {avatarUrl ? (
              <img src={avatarUrl} alt={profile.full_name || profile.email} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[--color-background-panel-2] text-[--color-foreground-muted] font-bold text-xl uppercase">
                {(profile.full_name || profile.email).charAt(0)}
              </div>
            )}
          </Avatar>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={triggerFileInput}
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload new"}
            </Button>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
            {avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDeleteAvatar}
                disabled={uploading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-text-secondary">
          Max size: 2MB. Supported formats: JPG, PNG, GIF
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-status-error/10 p-4 text-sm text-status-error">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-status-success/10 p-4 text-sm text-status-success">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Personal Information
          </h2>

          <Input
            label="Email"
            name="email"
            type="email"
            value={profile.email}
            disabled
            icon={<Mail />}
          />
          <p className="text-sm text-text-secondary -mt-2">Email cannot be changed</p>

          <Input
            label="Full Name"
            name="fullName"
            type="text"
            defaultValue={profile.full_name || ""}
            placeholder="Enter your full name"
            icon={<User />}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Preferences</h2>

          <div>
            <label htmlFor="theme" className="mb-2 block text-sm font-medium text-text-primary">
              Theme
            </label>
            <Select
              id="theme"
              name="theme"
              options={themeOptions}
              defaultValue="system"
            />
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="newsletter"
              name="newsletter"
              defaultChecked={profile.newsletter_subscribed}
              label={
                <div>
                  <div className="font-medium">Newsletter Subscription</div>
                  <div className="text-sm text-text-secondary">
                    Receive the latest news and updates from VNTV
                  </div>
                </div>
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-border pt-6">
          <Button type="submit" variant="primary" loading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
