-- Enterprise SaaS: Organizations & Multi-tenancy

-- 1. Create app_role enum for organization member roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- 2. Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create organization_members table (junction table)
CREATE TABLE public.organization_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- 4. Add organization_id to projects table (keeping user_id for migration, will use org_id going forward)
ALTER TABLE public.projects ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 5. Add organization_id to conversations table
ALTER TABLE public.conversations ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 6. Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 7. Create security definer function to check if user has a role in an organization
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id UUID, _org_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = _role
  )
$$;

-- 8. Create function to check if user is member of an organization (any role)
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
  )
$$;

-- 9. Create function to check if user has admin-level access (owner or admin)
CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role IN ('owner', 'admin')
  )
$$;

-- 10. Create function to get user's organizations
CREATE OR REPLACE FUNCTION public.get_user_organizations(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = _user_id
$$;

-- 11. RLS Policies for organizations
CREATE POLICY "Users can view organizations they are members of"
ON public.organizations FOR SELECT
USING (public.is_org_member(auth.uid(), id));

CREATE POLICY "Users can create organizations"
ON public.organizations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update their organizations"
ON public.organizations FOR UPDATE
USING (public.is_org_admin(auth.uid(), id));

CREATE POLICY "Owners can delete their organizations"
ON public.organizations FOR DELETE
USING (public.has_org_role(auth.uid(), id, 'owner'));

-- 12. RLS Policies for organization_members
CREATE POLICY "Members can view other members in their org"
ON public.organization_members FOR SELECT
USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can add members to their org"
ON public.organization_members FOR INSERT
WITH CHECK (public.is_org_admin(auth.uid(), organization_id) OR auth.uid() = user_id);

CREATE POLICY "Admins can update member roles"
ON public.organization_members FOR UPDATE
USING (public.is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can remove members"
ON public.organization_members FOR DELETE
USING (public.is_org_admin(auth.uid(), organization_id) OR auth.uid() = user_id);

-- 13. Update projects RLS to support org-based access (new policies)
CREATE POLICY "Org members can view org projects"
ON public.projects FOR SELECT
USING (
  (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id))
  OR (organization_id IS NULL AND auth.uid() = user_id)
);

CREATE POLICY "Org members can create org projects"
ON public.projects FOR INSERT
WITH CHECK (
  (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id))
  OR (organization_id IS NULL AND auth.uid() = user_id)
);

CREATE POLICY "Org admins can update org projects"
ON public.projects FOR UPDATE
USING (
  (organization_id IS NOT NULL AND public.is_org_admin(auth.uid(), organization_id))
  OR (organization_id IS NULL AND auth.uid() = user_id)
);

CREATE POLICY "Org admins can delete org projects"
ON public.projects FOR DELETE
USING (
  (organization_id IS NOT NULL AND public.is_org_admin(auth.uid(), organization_id))
  OR (organization_id IS NULL AND auth.uid() = user_id)
);

-- 14. Update conversations RLS to support org-based access
CREATE POLICY "Org members can view org conversations"
ON public.conversations FOR SELECT
USING (
  (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id))
  OR (organization_id IS NULL AND auth.uid() = user_id)
);

CREATE POLICY "Org members can create org conversations"
ON public.conversations FOR INSERT
WITH CHECK (
  (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id))
  OR (organization_id IS NULL AND auth.uid() = user_id)
);

CREATE POLICY "Org members can update org conversations"
ON public.conversations FOR UPDATE
USING (
  (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id))
  OR (organization_id IS NULL AND auth.uid() = user_id)
);

CREATE POLICY "Org admins can delete org conversations"
ON public.conversations FOR DELETE
USING (
  (organization_id IS NOT NULL AND public.is_org_admin(auth.uid(), organization_id))
  OR (organization_id IS NULL AND auth.uid() = user_id)
);

-- 15. Create updated_at trigger for organizations
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 16. Create invitations table for team invites
CREATE TABLE public.organization_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);

ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view invitations"
ON public.organization_invitations FOR SELECT
USING (public.is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can create invitations"
ON public.organization_invitations FOR INSERT
WITH CHECK (public.is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Admins can delete invitations"
ON public.organization_invitations FOR DELETE
USING (public.is_org_admin(auth.uid(), organization_id));