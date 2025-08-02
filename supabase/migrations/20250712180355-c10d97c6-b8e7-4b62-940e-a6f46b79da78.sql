-- Fix RLS policies for project_sections to allow guides to insert/update sections when setting due dates
DROP POLICY IF EXISTS "Guides can update project sections they guide" ON public.project_sections;
DROP POLICY IF EXISTS "Guides can view their project sections" ON public.project_sections;

-- Create comprehensive policies for guides
CREATE POLICY "Guides can manage their project sections" 
ON public.project_sections 
FOR ALL 
USING (project_id IN ( SELECT projects.id FROM projects WHERE (projects.guide_id = auth.uid())))
WITH CHECK (project_id IN ( SELECT projects.id FROM projects WHERE (projects.guide_id = auth.uid())));

-- Ensure HODs can also manage project sections
CREATE POLICY "HODs can manage all project sections" 
ON public.project_sections 
FOR ALL 
USING (EXISTS ( SELECT 1 FROM profiles WHERE (profiles.id = auth.uid()) AND (profiles.role = 'hod')))
WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE (profiles.id = auth.uid()) AND (profiles.role = 'hod')));