
import { Json } from '@/integrations/supabase/types';

export interface Project {
  id: string;
  title: string;
  description?: string;
  guide_id?: string;
  student_ids?: string[];
  department: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  deadline?: string;
}

export interface ProjectRequest {
  id: string;
  project_title: string;
  project_description: string;
  guide_id: string;
  student_id: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface ProjectSection {
  id: string;
  project_id?: string;
  section_type: string;
  content?: Json | any;
  files?: Json | any[];
  status?: string;
  due_date?: string;
  feedback?: string;
  score?: number;
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
}
