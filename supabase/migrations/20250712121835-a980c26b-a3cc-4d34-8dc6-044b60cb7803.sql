
-- Create the project_files storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_files', 'project_files', true);

-- Create RLS policies for the project_files bucket
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project_files');

CREATE POLICY "Allow authenticated users to view files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'project_files');

CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project_files');

CREATE POLICY "Allow authenticated users to update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project_files');
