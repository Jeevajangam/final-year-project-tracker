export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          content: string
          guide_id: string
          id: string
          milestone_id: string
          score: number | null
          status: string
          submitted_at: string
        }
        Insert: {
          content: string
          guide_id: string
          id?: string
          milestone_id: string
          score?: number | null
          status?: string
          submitted_at?: string
        }
        Update: {
          content?: string
          guide_id?: string
          id?: string
          milestone_id?: string
          score?: number | null
          status?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          id: string
          milestone_id: string
          name: string
          size: number
          type: string
          uploaded_at: string
          url: string
        }
        Insert: {
          id?: string
          milestone_id: string
          name: string
          size: number
          type: string
          uploaded_at?: string
          url: string
        }
        Update: {
          id?: string
          milestone_id?: string
          name?: string
          size?: number
          type?: string
          uploaded_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_uploads_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      final_presentations: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_url: string
          guide_id: string
          id: string
          project_id: string
          submitted_at: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size: number
          file_url: string
          guide_id: string
          id?: string
          project_id: string
          submitted_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_url?: string
          guide_id?: string
          id?: string
          project_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "final_presentations_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_presentations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_requests: {
        Row: {
          created_at: string
          guide_id: string
          hod_id: string
          id: string
          message: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guide_id: string
          hod_id: string
          id?: string
          message: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guide_id?: string
          hod_id?: string
          id?: string
          message?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guide_requests_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guide_requests_hod_id_fkey"
            columns: ["hod_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hod_invitations: {
        Row: {
          created_at: string
          guide_id: string
          hod_id: string
          id: string
          message: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guide_id: string
          hod_id: string
          id?: string
          message: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guide_id?: string
          hod_id?: string
          id?: string
          message?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hod_invitations_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hod_invitations_hod_id_fkey"
            columns: ["hod_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          feedback: string | null
          files: Json | null
          id: string
          project_id: string
          score: number | null
          section_type: string | null
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          feedback?: string | null
          files?: Json | null
          id?: string
          project_id: string
          score?: number | null
          section_type?: string | null
          status?: string
          submitted_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          feedback?: string | null
          files?: Json | null
          id?: string
          project_id?: string
          score?: number | null
          section_type?: string | null
          status?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          project_id: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          project_id?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          project_id?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          designation: string | null
          email: string
          guide_id: string | null
          id: string
          name: string
          office_room: string | null
          profile_picture_url: string | null
          role: string
          roll_number: string | null
          student_id: string | null
          updated_at: string
          year: string | null
          years_of_experience: number | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          designation?: string | null
          email: string
          guide_id?: string | null
          id: string
          name: string
          office_room?: string | null
          profile_picture_url?: string | null
          role: string
          roll_number?: string | null
          student_id?: string | null
          updated_at?: string
          year?: string | null
          years_of_experience?: number | null
        }
        Update: {
          created_at?: string
          department?: string | null
          designation?: string | null
          email?: string
          guide_id?: string | null
          id?: string
          name?: string
          office_room?: string | null
          profile_picture_url?: string | null
          role?: string
          roll_number?: string | null
          student_id?: string | null
          updated_at?: string
          year?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_data: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          project_id: string
          section_type: string
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          project_id: string
          section_type: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          project_id?: string
          section_type?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      project_requests: {
        Row: {
          created_at: string
          guide_id: string
          id: string
          project_description: string
          project_title: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guide_id: string
          id?: string
          project_description: string
          project_title: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guide_id?: string
          id?: string
          project_description?: string
          project_title?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_requests_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_sections: {
        Row: {
          content: Json | null
          created_at: string | null
          due_date: string | null
          feedback: string | null
          files: Json | null
          id: string
          project_id: string | null
          score: number | null
          section_type: string
          status: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          due_date?: string | null
          feedback?: string | null
          files?: Json | null
          id?: string
          project_id?: string | null
          score?: number | null
          section_type: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          due_date?: string | null
          feedback?: string | null
          files?: Json | null
          id?: string
          project_id?: string | null
          score?: number | null
          section_type?: string
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          completed_at: string | null
          created_at: string
          deadline: string | null
          department: string
          description: string | null
          final_report_submitted_at: string | null
          final_report_url: string | null
          guide_id: string | null
          id: string
          status: string
          student_ids: string[]
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          department: string
          description?: string | null
          final_report_submitted_at?: string | null
          final_report_url?: string | null
          guide_id?: string | null
          id?: string
          status?: string
          student_ids?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          department?: string
          description?: string | null
          final_report_submitted_at?: string | null
          final_report_url?: string | null
          guide_id?: string | null
          id?: string
          status?: string
          student_ids?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          project_id: string
          section_type: string
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          project_id: string
          section_type: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          project_id?: string
          section_type?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions_log: {
        Row: {
          action: string
          content: Json | null
          files: Json | null
          id: string
          project_id: string | null
          section_type: string
          student_id: string | null
          submitted_at: string | null
        }
        Insert: {
          action: string
          content?: Json | null
          files?: Json | null
          id?: string
          project_id?: string | null
          section_type: string
          student_id?: string | null
          submitted_at?: string | null
        }
        Update: {
          action?: string
          content?: Json | null
          files?: Json | null
          id?: string
          project_id?: string | null
          section_type?: string
          student_id?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_log_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
