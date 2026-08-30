// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";

export type OriginalsSettings = {
  title: string;
  description: string;
  cta_text: string;
  background_image_path: string | null;
};

/**
 * Get originals homepage settings
 */
export async function getOriginalsSettings() {
  const supabase = await createClient();

  try {
    const { data, error }: { data: any; error: any } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "homepage_originals")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching originals settings:", error);
      return {
        data: null,
        error: error.message,
      };
    }

    // If no settings exist, return defaults
    if (!data) {
      return {
        data: {
          title: "VNTV Originals",
          description: "Exclusive content you won't find anywhere else. Stories that matter, told our way.",
          cta_text: "Watch Now",
          background_image_path: null,
        },
        error: null,
      };
    }

    return { data: data.value as OriginalsSettings, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { data: null, error: "Failed to fetch originals settings" };
  }
}

/**
 * Update originals homepage settings
 */
export async function updateOriginalsSettings(settings: OriginalsSettings) {
  const supabase = await createClient();

  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Upsert settings
    const { error } = await supabase
      .from("site_settings")
      .upsert({
        key: "homepage_originals",
        value: settings,
        description: "Homepage originals promo section configuration",
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: "key",
      });

    if (error) {
      console.error("Error updating originals settings:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "Failed to update settings" };
  }
}

/**
 * Get latest originals (programmes with episodes)
 */
export async function getLatestOriginals(limit: number = 3) {
  const supabase = await createClient();

  try {
    const { data: programmes, error }: { data: any[] | null; error: any } = await supabase
      .from("programmes")
      .select(`
        id,
        name,
        slug,
        description,
        poster_id,
        presenter,
        programme_type
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching programmes:", error);
      return { data: null, error: error.message };
    }

    if (!programmes || programmes.length === 0) {
      return { data: [], error: null };
    }

    // Get posters
    const posterIds = programmes.map(p => p.poster_id).filter(Boolean);
    const postersResult = posterIds.length > 0
      ? await supabase.from("media_assets").select("id, storage_path, alt_text").in("id", posterIds)
      : { data: [], error: null };

    const postersMap = new Map(postersResult.data?.map((p: any) => [p.id, p]) || []);

    // Enrich programmes
    const enrichedProgrammes = programmes.map(programme => ({
      ...programme,
      poster: programme.poster_id ? postersMap.get(programme.poster_id) || null : null,
    }));

    return { data: enrichedProgrammes, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { data: null, error: "Failed to fetch originals" };
  }
}

/**
 * Get active programmes for public homepage
 */
export async function getActiveProgrammes() {
  const supabase = await createClient();

  try {
    const { data: programmes, error } = await supabase
      .from("programmes")
      .select("id, name, slug, description, presenter, programme_type, poster_id, is_active, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active programmes:", error);
      return { data: null, error: error.message };
    }

    // Get poster images
    if (programmes && programmes.length > 0) {
      const imageIds = programmes.map((p) => p.poster_id).filter(Boolean);
      
      if (imageIds.length > 0) {
        const { data: images } = await supabase
          .from("media_assets")
          .select("id, storage_path, alt_text")
          .in("id", imageIds);

        const imagesMap = new Map(images?.map((img: any) => [img.id, img]) || []);

        const enrichedProgrammes = programmes.map((prog) => ({
          ...prog,
          poster_image: prog.poster_id ? imagesMap.get(prog.poster_id) || null : null,
        }));

        return { data: enrichedProgrammes, error: null };
      }
    }

    return { data: programmes || [], error: null };
  } catch (err) {
    console.error("Error fetching active programmes:", err);
    return { data: null, error: "Failed to fetch programmes" };
  }
}
