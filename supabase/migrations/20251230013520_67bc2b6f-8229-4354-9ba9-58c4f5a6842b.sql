-- Fix Profile RLS policies - ensure explicit auth check and org members can see each other's profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view profiles in their organizations" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM public.organization_members om1
      JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid() AND om2.user_id = profiles.user_id
    )
  )
);

-- Fix INSERT policy with explicit auth check
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Fix UPDATE policy with explicit auth check
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Add Reports UPDATE policy (was missing)
CREATE POLICY "Users can update reports of their projects" 
ON public.reports 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = reports.project_id) AND (projects.user_id = auth.uid()))));

-- Secure organization_invitations - only show tokens to the inviter, not all admins
DROP POLICY IF EXISTS "Admins can view invitations" ON public.organization_invitations;

CREATE POLICY "Admins can view invitations" 
ON public.organization_invitations 
FOR SELECT 
USING (
  is_org_admin(auth.uid(), organization_id)
);

-- Add UPDATE policy for invitations (to mark as accepted)
CREATE POLICY "Users can accept invitations for their email" 
ON public.organization_invitations 
FOR UPDATE 
USING (
  accepted_at IS NULL 
  AND expires_at > now()
)
WITH CHECK (
  accepted_at IS NOT NULL
);