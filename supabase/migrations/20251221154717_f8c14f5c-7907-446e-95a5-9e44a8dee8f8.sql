-- Add INSERT and DELETE policies for recommendations table
CREATE POLICY "Users can create recommendations for their architectures" 
ON public.recommendations 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM architectures a
  JOIN projects p ON p.id = a.project_id
  WHERE a.id = recommendations.architecture_id AND p.user_id = auth.uid()
));

CREATE POLICY "Users can delete recommendations of their architectures" 
ON public.recommendations 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM architectures a
  JOIN projects p ON p.id = a.project_id
  WHERE a.id = recommendations.architecture_id AND p.user_id = auth.uid()
));