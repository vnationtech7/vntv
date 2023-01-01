"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Client-side role protection component
 * Checks if user has required role and redirects if not
 */

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export function RequireRole({ children, allowedRoles, fallback }: RequireRoleProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkPermission() {
      // Check authentication
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      // Check roles
      // @ts-ignore
      const { data } = await supabase
        .from("user_roles")
        .select(`
          roles (
            name
          )
        `)
        .eq("user_id", user.id);

      const userRoles = data?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];
      const hasRole = allowedRoles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        router.push("/unauthorized");
        return;
      }

      setHasPermission(true);
      setLoading(false);
    }

    checkPermission();
  }, [router, supabase, allowedRoles]);

  if (loading) {
    return (
      fallback || (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-vntv-red"></div>
        </div>
      )
    );
  }

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Convenience components for specific roles
 */

export function RequireEditor({ children, fallback }: Omit<RequireRoleProps, "allowedRoles">) {
  return (
    <RequireRole allowedRoles={["super_admin", "editor"]} fallback={fallback}>
      {children}
    </RequireRole>
  );
}

export function RequireArticleAccess({ children, fallback }: Omit<RequireRoleProps, "allowedRoles">) {
  return (
    <RequireRole allowedRoles={["super_admin", "editor", "reporter"]} fallback={fallback}>
      {children}
    </RequireRole>
  );
}

export function RequireVideoEditor({ children, fallback }: Omit<RequireRoleProps, "allowedRoles">) {
  return (
    <RequireRole allowedRoles={["super_admin", "editor", "video_editor"]} fallback={fallback}>
      {children}
    </RequireRole>
  );
}

export function RequireAnyStaff({ children, fallback }: Omit<RequireRoleProps, "allowedRoles">) {
  return (
    <RequireRole
      allowedRoles={["super_admin", "editor", "reporter", "video_editor", "advertising_manager"]}
      fallback={fallback}
    >
      {children}
    </RequireRole>
  );
}

export function RequireSuperAdmin({ children, fallback }: Omit<RequireRoleProps, "allowedRoles">) {
  return (
    <RequireRole allowedRoles={["super_admin"]} fallback={fallback}>
      {children}
    </RequireRole>
  );
}
