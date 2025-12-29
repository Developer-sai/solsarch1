import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type AppRole = "owner" | "admin" | "member" | "viewer";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  currentRole: AppRole | null;
  members: OrganizationMember[];
  loading: boolean;
  switchOrganization: (orgId: string) => void;
  createOrganization: (name: string, slug: string) => Promise<{ data: Organization | null; error: Error | null }>;
  updateOrganization: (orgId: string, updates: Partial<Organization>) => Promise<{ error: Error | null }>;
  deleteOrganization: (orgId: string) => Promise<{ error: Error | null }>;
  inviteMember: (email: string, role: AppRole) => Promise<{ error: Error | null }>;
  updateMemberRole: (memberId: string, role: AppRole) => Promise<{ error: Error | null }>;
  removeMember: (memberId: string) => Promise<{ error: Error | null }>;
  fetchMembers: () => Promise<void>;
  isAdmin: boolean;
  isOwner: boolean;
  canEdit: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

const CURRENT_ORG_KEY = "solsarch_current_org";

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentRole, setCurrentRole] = useState<AppRole | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's organizations
  const fetchOrganizations = useCallback(async () => {
    if (!user) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setCurrentRole(null);
      setLoading(false);
      return;
    }

    try {
      // Get all organizations where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from("organization_members")
        .select(`
          organization_id,
          role,
          organizations (
            id,
            name,
            slug,
            logo_url,
            created_at,
            updated_at
          )
        `)
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      const orgs = memberData
        ?.map((m) => m.organizations as unknown as Organization)
        .filter(Boolean) || [];
      
      setOrganizations(orgs);

      // Restore last selected org or pick first
      const savedOrgId = localStorage.getItem(CURRENT_ORG_KEY);
      const savedOrg = orgs.find((o) => o.id === savedOrgId);
      const selectedOrg = savedOrg || orgs[0] || null;
      
      if (selectedOrg) {
        const memberRole = memberData?.find(
          (m) => m.organization_id === selectedOrg.id
        )?.role as AppRole;
        setCurrentOrganization(selectedOrg);
        setCurrentRole(memberRole || null);
        localStorage.setItem(CURRENT_ORG_KEY, selectedOrg.id);
      } else {
        setCurrentOrganization(null);
        setCurrentRole(null);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const switchOrganization = useCallback((orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem(CURRENT_ORG_KEY, orgId);
      
      // Fetch role for this org
      if (user) {
        supabase
          .from("organization_members")
          .select("role")
          .eq("organization_id", orgId)
          .eq("user_id", user.id)
          .single()
          .then(({ data }) => {
            setCurrentRole(data?.role as AppRole || null);
          });
      }
    }
  }, [organizations, user]);

  const createOrganization = async (name: string, slug: string) => {
    if (!user) return { data: null, error: new Error("Not authenticated") };

    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({ name, slug })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as owner
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      // Refresh organizations list
      await fetchOrganizations();
      
      return { data: org as Organization, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const updateOrganization = async (orgId: string, updates: Partial<Organization>) => {
    try {
      const { error } = await supabase
        .from("organizations")
        .update(updates)
        .eq("id", orgId);

      if (error) throw error;
      await fetchOrganizations();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const deleteOrganization = async (orgId: string) => {
    try {
      const { error } = await supabase
        .from("organizations")
        .delete()
        .eq("id", orgId);

      if (error) throw error;
      await fetchOrganizations();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const fetchMembers = useCallback(async () => {
    if (!currentOrganization) {
      setMembers([]);
      return;
    }

    try {
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from("organization_members")
        .select("id, organization_id, user_id, role, created_at")
        .eq("organization_id", currentOrganization.id);

      if (membersError) throw membersError;

      if (!membersData || membersData.length === 0) {
        setMembers([]);
        return;
      }

      // Fetch profiles for these users
      const userIds = membersData.map(m => m.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(
        profilesData?.map(p => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url }]) || []
      );

      setMembers(membersData.map(m => ({
        ...m,
        profile: profilesMap.get(m.user_id) || undefined
      })));
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  }, [currentOrganization]);

  const inviteMember = async (email: string, role: AppRole) => {
    if (!currentOrganization || !user) {
      return { error: new Error("No organization selected") };
    }

    try {
      const { error } = await supabase
        .from("organization_invitations")
        .insert({
          organization_id: currentOrganization.id,
          email: email.toLowerCase(),
          role,
          invited_by: user.id,
        });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateMemberRole = async (memberId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from("organization_members")
        .update({ role })
        .eq("id", memberId);

      if (error) throw error;
      await fetchMembers();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      await fetchMembers();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const isOwner = currentRole === "owner";
  const isAdmin = currentRole === "owner" || currentRole === "admin";
  const canEdit = currentRole === "owner" || currentRole === "admin" || currentRole === "member";

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrganization,
        currentRole,
        members,
        loading,
        switchOrganization,
        createOrganization,
        updateOrganization,
        deleteOrganization,
        inviteMember,
        updateMemberRole,
        removeMember,
        fetchMembers,
        isAdmin,
        isOwner,
        canEdit,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
