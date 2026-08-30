// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProgrammeData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  presenter: string | null;
  programme_type: string | null; // e.g., "talk_show", "documentary", "news_analysis", "entertainment"
  poster_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  poster_image?: {
    id: string;
    storage_path: string;
    alt_text: string | null;
  } | null;
};

/**
 * Get all programmes for CMS
 */
export async function getAllProgrammes() {
  const supabase = await createClient();

  try {
    const { data: programmes, error } = await supabase
      .from("programmes")
      .select("id, name, slug, description, presenter, programme_type, poster_id, is_active, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error && error.message) {
      console.error("Error fetching programmes:", error);
      return { data: null, error: error.message };
    }

    // If no programmes, return empty array
    if (!programmes || programmes.length === 0) {
      return { data: [], error: null };
    }

    // Get poster images
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

    return { data: programmes || [], error: null };
  } catch (err) {
    console.error("Exception fetching programmes:", err);
    return { data: null, error: "Failed to fetch programmes" };
  }
}

/**
 * Get single programme by ID
 */
export async function getProgramme(id: string) {
  const supabase = await createClient();

  try {
    const { data: programme, error } = await supabase
      .from("programmes")
      .select("id, name, slug, description, presenter, programme_type, poster_id, is_active, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !programme) {
      return { data: null, error: "Programme not found" };
    }

    // Get poster image if exists
    if (programme.poster_id) {
      const { data: image } = await supabase
        .from("media_assets")
        .select("id, storage_path, alt_text")
        .eq("id", programme.poster_id)
        .single();

      programme.poster_image = image;
    }

    return { data: programme, error: null };
  } catch (err) {
    console.error("Error fetching programme:", err);
    return { data: null, error: "Failed to fetch programme" };
  }
}

/**
 * Get programme by slug (for public pages)
 */
export async function getProgrammeBySlug(slug: string) {
  const supabase = await createClient();

  try {
    const { data: programme, error } = await supabase
      .from("programmes")
      .select("id, name, slug, description, presenter, programme_type, poster_id, is_active, created_at")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !programme) {
      return { data: null, error: "Programme not found" };
    }

    // Get poster image
    if (programme.poster_id) {
      const { data: image } = await supabase
        .from("media_assets")
        .select("id, storage_path, alt_text")
        .eq("id", programme.poster_id)
        .single();

      programme.poster_image = image;
    }

    return { data: programme, error: null };
  } catch (err) {
    console.error("Error fetching programme:", err);
    return { data: null, error: "Failed to fetch programme" };
  }
}

/**
 * Create new programme
 */
export async function createProgramme(data: {
  name: string;
  slug: string;
  description?: string;
  presenter?: string;
  programme_type?: string;
  poster_id?: string;
  is_active?: boolean;
}) {
  const supabase = await createClient();

  try {
    const { data: programme, error } = await supabase
      .from("programmes")
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        presenter: data.presenter || null,
        programme_type: data.programme_type || null,
        poster_id: data.poster_id || null,
        is_active: data.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating programme:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/admin/programmes");
    return { data: programme, error: null };
  } catch (err) {
    console.error("Error creating programme:", err);
    return { data: null, error: "Failed to create programme" };
  }
}

/**
 * Update programme
 */
export async function updateProgramme(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    presenter?: string;
    programme_type?: string;
    poster_id?: string;
    is_active?: boolean;
  }
) {
  const supabase = await createClient();

  try {
    const { data: programme, error } = await supabase
      .from("programmes")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating programme:", error);
      return { data: null, error: error.message };
    }

    revalidatePath("/admin/programmes");
    revalidatePath(`/originals/${data.slug || ""}`);
    return { data: programme, error: null };
  } catch (err) {
    console.error("Error updating programme:", err);
    return { data: null, error: "Failed to update programme" };
  }
}

/**
 * Delete programme
 */
export async function deleteProgramme(id: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("programmes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting programme:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/programmes");
    return { success: true, error: null };
  } catch (err) {
    console.error("Error deleting programme:", err);
    return { success: false, error: "Failed to delete programme" };
  }
}


