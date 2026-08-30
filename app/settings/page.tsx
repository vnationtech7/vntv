import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/layout/container";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata = {
  title: "Settings - VNTV",
  description: "Manage your profile and preferences",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Get profile
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // If profile doesn't exist yet, create it
    if (error?.code === "PGRST116") {
      const { createProfile } = await import("@/app/profile/actions");
      const result = await createProfile(user.id, user.email || "");

      if (result.error) {
        return (
          <Container>
            <div className="py-12 text-center">
              <p className="text-status-error">Error loading profile</p>
            </div>
          </Container>
        );
      }

      // Redirect to refresh with new profile
      redirect("/settings");
    }

    return (
      <Container>
        <div className="py-12 text-center">
          <p className="text-status-error">Error loading profile</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-text-primary">Settings</h1>
        <ProfileForm profile={profile} />
      </div>
    </Container>
  );
}
