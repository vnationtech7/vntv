"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Role {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

/**
 * Hook to fetch all roles
 */
export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function loadRoles() {
      try {
        setLoading(true);
        setError(null);

        // @ts-ignore - Database schema will be set up in Milestone 1
        const { data, error: rolesError } = await supabase
          .from("roles")
          .select("*")
          .order("name");

        if (rolesError) {
          console.error("Error loading roles:", rolesError);
          if (isMounted) {
            setError(rolesError.message);
          }
        } else if (isMounted) {
          setRoles(data || []);
        }
      } catch (err) {
        console.error("Error in loadRoles:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  return { roles, loading, error };
}
