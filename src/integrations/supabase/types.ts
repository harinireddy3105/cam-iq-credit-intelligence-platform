export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          borrower_name: string
          capacity_score: number | null
          capital_score: number | null
          character_score: number | null
          cin: string | null
          collateral_score: number | null
          composite_score: number | null
          conditions_score: number | null
          created_at: string
          created_by: string
          id: string
          interest_rate: number | null
          loan_recommended: number | null
          loan_requested: number | null
          recommendation_rationale: string | null
          sector: string | null
          status: string
          tenure_months: number | null
          updated_at: string
        }
        Insert: {
          borrower_name: string
          capacity_score?: number | null
          capital_score?: number | null
          character_score?: number | null
          cin?: string | null
          collateral_score?: number | null
          composite_score?: number | null
          conditions_score?: number | null
          created_at?: string
          created_by: string
          id?: string
          interest_rate?: number | null
          loan_recommended?: number | null
          loan_requested?: number | null
          recommendation_rationale?: string | null
          sector?: string | null
          status?: string
          tenure_months?: number | null
          updated_at?: string
        }
        Update: {
          borrower_name?: string
          capacity_score?: number | null
          capital_score?: number | null
          character_score?: number | null
          cin?: string | null
          collateral_score?: number | null
          composite_score?: number | null
          conditions_score?: number | null
          created_at?: string
          created_by?: string
          id?: string
          interest_rate?: number | null
          loan_recommended?: number | null
          loan_requested?: number | null
          recommendation_rationale?: string | null
          sector?: string | null
          status?: string
          tenure_months?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      covenants: {
        Row: {
          assessment_id: string
          covenant_text: string | null
          created_at: string
          id: string
        }
        Insert: {
          assessment_id: string
          covenant_text?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          assessment_id?: string
          covenant_text?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "covenants_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          assessment_id: string
          created_at: string
          doc_type: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          status: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          doc_type?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          status?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          doc_type?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      field_notes: {
        Row: {
          affected_dimension: string | null
          assessment_id: string
          created_at: string
          created_by: string | null
          explanation: string | null
          id: string
          note_text: string | null
          score_delta: number | null
        }
        Insert: {
          affected_dimension?: string | null
          assessment_id: string
          created_at?: string
          created_by?: string | null
          explanation?: string | null
          id?: string
          note_text?: string | null
          score_delta?: number | null
        }
        Update: {
          affected_dimension?: string | null
          assessment_id?: string
          created_at?: string
          created_by?: string | null
          explanation?: string | null
          id?: string
          note_text?: string | null
          score_delta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "field_notes_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_flags: {
        Row: {
          assessment_id: string
          created_at: string
          evidence: string | null
          fraud_type: string | null
          id: string
          severity: string | null
          source_a: string | null
          source_b: string | null
          variance_amount: string | null
        }
        Insert: {
          assessment_id: string
          created_at?: string
          evidence?: string | null
          fraud_type?: string | null
          id?: string
          severity?: string | null
          source_a?: string | null
          source_b?: string | null
          variance_amount?: string | null
        }
        Update: {
          assessment_id?: string
          created_at?: string
          evidence?: string | null
          fraud_type?: string | null
          id?: string
          severity?: string | null
          source_a?: string | null
          source_b?: string | null
          variance_amount?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_flags_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch: string | null
          created_at: string
          email: string | null
          employee_id: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          avatar_url?: string | null
          branch?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          avatar_url?: string | null
          branch?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      research_findings: {
        Row: {
          assessment_id: string
          created_at: string
          finding: string | null
          id: string
          sentiment: string | null
          source: string | null
        }
        Insert: {
          assessment_id: string
          created_at?: string
          finding?: string | null
          id?: string
          sentiment?: string | null
          source?: string | null
        }
        Update: {
          assessment_id?: string
          created_at?: string
          finding?: string | null
          id?: string
          sentiment?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_findings_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "credit_officer" | "branch_manager" | "risk_committee" | "admin"
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
    Enums: {
      app_role: ["credit_officer", "branch_manager", "risk_committee", "admin"],
    },
  },
} as const
