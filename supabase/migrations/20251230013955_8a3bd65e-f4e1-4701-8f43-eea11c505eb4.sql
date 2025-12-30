-- Fix organization_invitations UPDATE policy to verify email matches the authenticated user
DROP POLICY IF EXISTS "Users can accept invitations for their email" ON public.organization_invitations;

CREATE POLICY "Users can accept invitations for their email" 
ON public.organization_invitations 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL
  AND accepted_at IS NULL 
  AND expires_at > now()
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  accepted_at IS NOT NULL
);