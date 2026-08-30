"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side admin route protection
 * Redirects non-admin users to home page
 */
export function AdminRoute({ children, fallback }: AdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      // Check if user has admin role
      // @ts-ignore - Database schema will be set up in Milestone 1
      const { data } = await supabase
        .from("user_roles")
        .select(`
          roles (
            name
          )
        `)
        .eq("user_id", user.id);

      const hasAdminRole = data?.some((ur: any) => ur.roles?.name === "admin");

      if (!hasAdminRole) {
        router.push("/");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    }

    checkAdmin();
  }, [router, supabase]);

  if (loading) {
    return (
      fallback || (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[--color-vntv-red]"></div>
        </div>
      )
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
