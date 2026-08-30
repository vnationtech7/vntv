// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Subscribe email to newsletter
 */
export async function subscribeToNewsletter(email: string) {
  const supabase = await createClient();

  try {
    // Check if email already exists
    const { data: existing, error: checkError }: { data: any; error: any } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error checking subscriber:", checkError);
      return { success: false, error: "Failed to check subscription status" };
    }

    // If email exists and is active
    if (existing && existing.is_active) {
      return { success: false, error: "This email is already subscribed" };
    }

    // If email exists but is inactive, reactivate it
    if (existing && !existing.is_active) {
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({ is_active: true, updated_at: new Date().toISOString() } as any)
        .eq("id", existing.id);

      if (updateError) {
        console.error("Error reactivating subscription:", updateError);
        return { success: false, error: "Failed to reactivate subscription" };
      }

      return { success: true, error: null, message: "Welcome back! Your subscription has been reactivated." };
    }

    // Create new subscription
    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email,
        is_active: true,
        subscribed_at: new Date().toISOString(),
      } as any);

    if (insertError) {
      console.error("Error creating subscription:", insertError);
      return { success: false, error: "Failed to subscribe. Please try again." };
    }

    return { success: true, error: null, message: "Thank you for subscribing!" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Unsubscribe email from newsletter
 */
export async function unsubscribeFromNewsletter(email: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ is_active: false, updated_at: new Date().toISOString() } as any)
      .eq("email", email);

    if (error) {
      console.error("Error unsubscribing:", error);
      return { success: false, error: "Failed to unsubscribe" };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}
