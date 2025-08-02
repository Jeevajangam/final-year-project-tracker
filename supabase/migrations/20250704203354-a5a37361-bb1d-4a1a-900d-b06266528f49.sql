
-- Add final report columns to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS final_report_url text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS final_report_submitted_at timestamp with time zone;

-- Create notifications table for HOD alerts
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Create storage bucket for final reports if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'final-reports',
  'final-reports',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for final reports
CREATE POLICY "Students can upload final reports" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'final-reports' AND
  (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM projects p WHERE auth.uid() = ANY(p.student_ids)
  )
);

CREATE POLICY "Students can update their final reports" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'final-reports' AND
  (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM projects p WHERE auth.uid() = ANY(p.student_ids)
  )
);

CREATE POLICY "Project members can view final reports" ON storage.objects
FOR SELECT USING (
  bucket_id = 'final-reports' AND
  (storage.foldername(name))[1] IN (
    SELECT p.id::text FROM projects p 
    WHERE auth.uid() = p.guide_id 
    OR auth.uid() = ANY(p.student_ids)
    OR EXISTS (
      SELECT 1 FROM profiles pr 
      WHERE pr.id = auth.uid() 
      AND pr.role = 'hod' 
      AND pr.department = (
        SELECT pg.department FROM profiles pg WHERE pg.id = p.guide_id
      )
    )
  )
);
