// @ts-nocheck
"use server";

import { createClient } from "@/lib/supabase/server";
import { sendVerificationEmail } from "@/lib/email/newsletter";
import crypto from "crypto";

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Subscribe email to newsletter with double opt-in
 */
export async function subscribeToNewsletter(email: string) {
  const supabase = await createClient();

  try {
    // Validate email format
    if (!isValidEmail(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const { data: existing, error: checkError }: { data: any; error: any } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active, verified_at, verification_token")
      .eq("email", normalizedEmail)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error checking subscriber:", checkError);
      return { success: false, error: "Failed to check subscription status" };
    }

    // If email exists and is verified & active
    if (existing && existing.is_active && existing.verified_at) {
      return { success: false, error: "This email is already subscribed and verified" };
    }

    // If email exists but not verified, resend verification
    if (existing && !existing.verified_at) {
      const verificationToken = existing.verification_token || generateToken();
      
      // Update verification token if missing
      if (!existing.verification_token) {
        await supabase
          .from("newsletter_subscribers")
          .update({ verification_token: verificationToken })
          .eq("id", existing.id);
      }

      // Resend verification email
      const emailSent = await sendVerificationEmail(normalizedEmail, verificationToken);
      
      if (!emailSent) {
        return { success: false, error: "Failed to send verification email" };
      }

      return { 
        success: true, 
        error: null, 
        message: "Verification email resent! Please check your inbox." 
      };
    }

    // If email exists but is inactive (unsubscribed), offer resubscription
    if (existing && !existing.is_active) {
      const verificationToken = generateToken();
      const unsubscribeToken = generateToken();

      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({ 
          is_active: true,
          verification_token: verificationToken,
          unsubscribe_token: unsubscribeToken,
          verified_at: null, // Require re-verification
          subscribed_at: new Date().toISOString(),
        } as any)
        .eq("id", existing.id);

      if (updateError) {
        console.error("Error reactivating subscription:", updateError);
        return { success: false, error: "Failed to reactivate subscription" };
      }

      // Send verification email
      const emailSent = await sendVerificationEmail(normalizedEmail, verificationToken);
      
      if (!emailSent) {
        return { success: false, error: "Subscription created but failed to send verification email" };
      }

      return { 
        success: true, 
        error: null, 
        message: "Welcome back! Please check your email to verify your subscription." 
      };
    }

    // Create new subscription with verification required
    const verificationToken = generateToken();
    const unsubscribeToken = generateToken();

    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: normalizedEmail,
        is_active: true,
        verification_token: verificationToken,
        unsubscribe_token: unsubscribeToken,
        subscribed_at: new Date().toISOString(),
        verified_at: null, // Not verified yet
      } as any);

    if (insertError) {
      console.error("Error creating subscription:", insertError);
      return { success: false, error: "Failed to subscribe. Please try again." };
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(normalizedEmail, verificationToken);
    
    if (!emailSent) {
      // Rollback - delete the subscriber since email failed
      await supabase
        .from("newsletter_subscribers")
        .delete()
        .eq("email", normalizedEmail);
      
      return { success: false, error: "Failed to send verification email. Please try again." };
    }

    return { 
      success: true, 
      error: null, 
      message: "Almost there! Please check your email to verify your subscription." 
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Verify newsletter subscription with token
 */
export async function verifyNewsletterSubscription(token: string) {
  const supabase = await createClient();

  try {
    if (!token) {
      return { success: false, error: "Invalid verification token" };
    }

    // Find subscriber with this token
    const { data: subscriber, error: findError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, verified_at")
      .eq("verification_token", token)
      .single();

    if (findError || !subscriber) {
      return { success: false, error: "Invalid or expired verification token" };
    }

    // Check if already verified
    if (subscriber.verified_at) {
      return { 
        success: true, 
        error: null, 
        message: "Your subscription is already verified!",
        alreadyVerified: true 
      };
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({ 
        verified_at: new Date().toISOString(),
        verification_token: null, // Clear token after use
      } as any)
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Error verifying subscription:", updateError);
      return { success: false, error: "Failed to verify subscription" };
    }

    return { 
      success: true, 
      error: null, 
      message: "Thank you! Your subscription has been verified.",
      email: subscriber.email 
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Unsubscribe with token (one-click unsubscribe)
 */
export async function unsubscribeWithToken(token: string) {
  const supabase = await createClient();

  try {
    if (!token) {
      return { success: false, error: "Invalid unsubscribe token" };
    }

    // Find subscriber with this token
    const { data: subscriber, error: findError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, is_active")
      .eq("unsubscribe_token", token)
      .single();

    if (findError || !subscriber) {
      return { success: false, error: "Invalid unsubscribe link" };
    }

    // Check if already unsubscribed
    if (!subscriber.is_active) {
      return { 
        success: true, 
        error: null, 
        message: "You are already unsubscribed",
        email: subscriber.email,
        alreadyUnsubscribed: true 
      };
    }

    // Unsubscribe
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({ 
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
      } as any)
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Error unsubscribing:", updateError);
      return { success: false, error: "Failed to unsubscribe" };
    }

    return { 
      success: true, 
      error: null, 
      message: "You have been unsubscribed successfully",
      email: subscriber.email 
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Resubscribe after unsubscribing
 */
export async function resubscribeWithToken(token: string) {
  const supabase = await createClient();

  try {
    if (!token) {
      return { success: false, error: "Invalid token" };
    }

    // Find subscriber with this token
    const { data: subscriber, error: findError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, is_active")
      .eq("unsubscribe_token", token)
      .single();

    if (findError || !subscriber) {
      return { success: false, error: "Invalid resubscribe link" };
    }

    // Check if already subscribed
    if (subscriber.is_active) {
      return { 
        success: true, 
        error: null, 
        message: "You are already subscribed!",
        alreadySubscribed: true 
      };
    }

    // Resubscribe
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({ 
        is_active: true,
        unsubscribed_at: null,
      } as any)
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Error resubscribing:", updateError);
      return { success: false, error: "Failed to resubscribe" };
    }

    return { 
      success: true, 
      error: null, 
      message: "Welcome back! You have been resubscribed.",
      email: subscriber.email 
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Unsubscribe by email (for user profile)
 */
export async function unsubscribeByEmail(email: string) {
  const supabase = await createClient();

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ 
        is_active: false, 
        unsubscribed_at: new Date().toISOString() 
      } as any)
      .eq("email", normalizedEmail);

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
