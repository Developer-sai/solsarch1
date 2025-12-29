-- Add UPDATE policy for cost_scenarios table
CREATE POLICY "Users can update cost scenarios of their architectures" 
ON public.cost_scenarios 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.architectures a 
    JOIN public.projects p ON p.id = a.project_id 
    WHERE a.id = cost_scenarios.architecture_id 
    AND p.user_id = auth.uid()
  )
);