"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  theme: "light" | "dark" | "system" | null;
  newsletter_subscribed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new user profile
 * Called automatically after signup
 */
export async function createProfile(userId: string, email: string) {
  // Use admin client to bypass RLS for profile creation
  const supabase = createAdminClient();

  // @ts-ignore - Database schema will be set up in Milestone 1
  const { data, error } = await supabase
    .from("profiles")
    // @ts-ignore
    .insert([{
      id: userId,
      email,
      full_name: null,
      avatar_url: null,
      bio: null,
      newsletter_subscribed: false,
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating profile:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return { error: error.message || "Failed to create profile", data: null };
  }

  return { data: data as ProfileData, error: null };
}

/**
 * Update user profile
 */
export async function updateProfile(updates: {
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  newsletter_subscribed?: boolean;
}) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  // @ts-ignore - Database schema will be set up in Milestone 1
  const { data, error} = await supabase
    .from("profiles")
    // @ts-ignore
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    } as any)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return { error: error.message, data: null };
  }

  revalidatePath("/profile");
  revalidatePath("/settings");

  return { data: data as ProfileData, error: null };
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const file = formData.get("avatar") as File;
  if (!file) {
    return { error: "No file provided", data: null };
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image", data: null };
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { error: "File size must be less than 2MB", data: null };
  }

  // Create unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError);
    return { error: uploadError.message, data: null };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(filePath);

  // Update profile with new avatar URL
  // @ts-ignore - Database schema will be set up in Milestone 1
  const { error: updateError } = await supabase
    .from("profiles")
    // @ts-ignore
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    } as any)
    .eq("id", user.id);

  if (updateError) {
    console.error("Error updating profile with avatar:", updateError);
    return { error: updateError.message, data: null };
  }

  revalidatePath("/profile");
  revalidatePath("/settings");

  return { data: { url: publicUrl }, error: null };
}

/**
 * Delete avatar
 */
export async function deleteAvatar() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get current profile to find avatar URL
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  const typedProfile = profile as { avatar_url: string | null } | null;

  if (!typedProfile?.avatar_url) {
    return { error: "No avatar to delete" };
  }

  // Extract file path from URL
  const urlParts = typedProfile.avatar_url.split("/");
  const fileName = urlParts[urlParts.length - 1];
  const filePath = `avatars/${fileName}`;

  // Delete from storage
  const { error: deleteError } = await supabase.storage
    .from("media")
    .remove([filePath]);

  if (deleteError) {
    console.error("Error deleting avatar from storage:", deleteError);
    // Continue anyway to clear the URL from profile
  }

  // Update profile to remove avatar URL
  // @ts-ignore - Database schema will be set up in Milestone 1
  const { error: updateError } = await supabase
    .from("profiles")
    // @ts-ignore
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    } as any)
    .eq("id", user.id);

  if (updateError) {
    console.error("Error updating profile:", updateError);
    return { error: updateError.message };
  }

  revalidatePath("/profile");
  revalidatePath("/settings");

  return { error: null };
}
