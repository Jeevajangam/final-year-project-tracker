
-- Add columns to support due dates, scoring, and feedback for different sections
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS section_type TEXT;
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]';

-- Create a project_sections table to track individual sections with due dates and scores
CREATE TABLE IF NOT EXISTS project_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  files JSONB DEFAULT '[]',
  due_date TIMESTAMP WITH TIME ZONE,
  score DECIMAL(3,1) CHECK (score >= 0 AND score <= 10),
  feedback TEXT,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_sections_project_id ON project_sections(project_id);
CREATE INDEX IF NOT EXISTS idx_project_sections_type ON project_sections(section_type);

-- Enable RLS on project_sections
ALTER TABLE project_sections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_sections
CREATE POLICY "Students can view their project sections" ON project_sections
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE auth.uid() = ANY(student_ids)
    )
  );

CREATE POLICY "Guides can view their project sections" ON project_sections
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE guide_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their project sections" ON project_sections
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects WHERE auth.uid() = ANY(student_ids)
    )
  );

CREATE POLICY "Guides can update project sections they guide" ON project_sections
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects WHERE guide_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their project sections" ON project_sections
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE auth.uid() = ANY(student_ids)
    )
  );

-- Update projects table to support completion status
ALTER TABLE projects ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add a submissions_log table to track all submissions
CREATE TABLE IF NOT EXISTS submissions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  action TEXT NOT NULL, -- 'submit', 'update', 'reupload'
  files JSONB DEFAULT '[]',
  content JSONB DEFAULT '{}',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on submissions_log
ALTER TABLE submissions_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for submissions_log
CREATE POLICY "Students can view their submissions" ON submissions_log
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Guides can view submissions for their projects" ON submissions_log
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE guide_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their submissions" ON submissions_log
  FOR INSERT WITH CHECK (student_id = auth.uid());
