import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type Organization = {
  id: string;
  name: string;
  currency: string;
  created_at: string;
};

export type Membership = {
  role: "owner" | "admin" | "member";
  organizations: Organization;
};

type OrgContextValue = {
  user: User | null;
  profileName: string;
  memberships: Membership[];
  org: Organization | null;
  role: Membership["role"] | null;
  setOrgId: (id: string) => void;
  loading: boolean;
  refetch: () => void;
};

const OrgContext = createContext<OrgContextValue | null>(null);
const STORAGE_KEY = "fluxo.org-id";

export function OrgProvider({ user, children }: { user: User; children: ReactNode }) {
  const queryClient = useQueryClient();
  const [orgId, setOrgIdState] = useState<string | null>(null);

  useEffect(() => {
    setOrgIdState(window.localStorage.getItem(STORAGE_KEY));
  }, []);

  const membershipsQuery = useQuery({
    queryKey: ["memberships", user.id],
    queryFn: async (): Promise<Membership[]> => {
      const { data, error } = await supabase
        .from("organization_members")
        .select("role, organizations(id, name, currency, created_at)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? [])
        .filter((m) => m.organizations)
        .map((m) => ({
          role: m.role as Membership["role"],
          organizations: m.organizations as unknown as Organization,
        }));
    },
  });

  const profileQuery = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const memberships = membershipsQuery.data ?? [];
  const current =
    memberships.find((m) => m.organizations.id === orgId) ?? memberships[0] ?? null;

  const value = useMemo<OrgContextValue>(
    () => ({
      user,
      profileName:
        profileQuery.data?.full_name ||
        (user.user_metadata?.["full_name"] as string | undefined) ||
        user.email ||
        "Usuário",
      memberships,
      org: current?.organizations ?? null,
      role: current?.role ?? null,
      loading: membershipsQuery.isLoading,
      setOrgId: (id: string) => {
        window.localStorage.setItem(STORAGE_KEY, id);
        setOrgIdState(id);
        queryClient.invalidateQueries();
      },
      refetch: () => {
        void membershipsQuery.refetch();
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, profileQuery.data, membershipsQuery.data, membershipsQuery.isLoading, orgId],
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg deve ser usado dentro de OrgProvider");
  return ctx;
}

/** Id da organização atual — lança se ainda não houver (rotas usam enabled). */
export function useOrgId() {
  return useOrg().org?.id ?? null;
}
