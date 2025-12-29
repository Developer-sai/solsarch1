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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      architecture_components: {
        Row: {
          architecture_id: string
          config: Json | null
          created_at: string
          hours_per_month: number
          id: string
          monthly_cost: number | null
          name: string
          position_x: number | null
          position_y: number | null
          provider_id: string | null
          quantity: number
          service_type: string
          sku_id: string | null
        }
        Insert: {
          architecture_id: string
          config?: Json | null
          created_at?: string
          hours_per_month?: number
          id?: string
          monthly_cost?: number | null
          name: string
          position_x?: number | null
          position_y?: number | null
          provider_id?: string | null
          quantity?: number
          service_type: string
          sku_id?: string | null
        }
        Update: {
          architecture_id?: string
          config?: Json | null
          created_at?: string
          hours_per_month?: number
          id?: string
          monthly_cost?: number | null
          name?: string
          position_x?: number | null
          position_y?: number | null
          provider_id?: string | null
          quantity?: number
          service_type?: string
          sku_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "architecture_components_architecture_id_fkey"
            columns: ["architecture_id"]
            isOneToOne: false
            referencedRelation: "architectures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "architecture_components_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "architecture_components_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
        ]
      }
      architectures: {
        Row: {
          assumptions: string[] | null
          created_at: string
          description: string | null
          diagram_data: Json | null
          id: string
          name: string
          project_id: string
          requirement_id: string | null
          total_monthly_cost: number | null
          trade_offs: string[] | null
          updated_at: string
          variant: string
        }
        Insert: {
          assumptions?: string[] | null
          created_at?: string
          description?: string | null
          diagram_data?: Json | null
          id?: string
          name: string
          project_id: string
          requirement_id?: string | null
          total_monthly_cost?: number | null
          trade_offs?: string[] | null
          updated_at?: string
          variant: string
        }
        Update: {
          assumptions?: string[] | null
          created_at?: string
          description?: string | null
          diagram_data?: Json | null
          id?: string
          name?: string
          project_id?: string
          requirement_id?: string | null
          total_monthly_cost?: number | null
          trade_offs?: string[] | null
          updated_at?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "architectures_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "architectures_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_scenarios: {
        Row: {
          architecture_id: string
          cost_breakdown: Json | null
          created_at: string
          id: string
          name: string
          parameters: Json
          scenario_type: string
          total_monthly_cost: number | null
        }
        Insert: {
          architecture_id: string
          cost_breakdown?: Json | null
          created_at?: string
          id?: string
          name: string
          parameters?: Json
          scenario_type: string
          total_monthly_cost?: number | null
        }
        Update: {
          architecture_id?: string
          cost_breakdown?: Json | null
          created_at?: string
          id?: string
          name?: string
          parameters?: Json
          scenario_type?: string
          total_monthly_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cost_scenarios_architecture_id_fkey"
            columns: ["architecture_id"]
            isOneToOne: false
            referencedRelation: "architectures"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          regions: string[] | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          regions?: string[] | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          regions?: string[] | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          action_items: string[] | null
          architecture_id: string
          created_at: string
          description: string
          id: string
          impact_amount: number | null
          impact_percentage: number | null
          is_applied: boolean
          priority: string
          title: string
          type: string
        }
        Insert: {
          action_items?: string[] | null
          architecture_id: string
          created_at?: string
          description: string
          id?: string
          impact_amount?: number | null
          impact_percentage?: number | null
          is_applied?: boolean
          priority: string
          title: string
          type: string
        }
        Update: {
          action_items?: string[] | null
          architecture_id?: string
          created_at?: string
          description?: string
          id?: string
          impact_amount?: number | null
          impact_percentage?: number | null
          is_applied?: boolean
          priority?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_architecture_id_fkey"
            columns: ["architecture_id"]
            isOneToOne: false
            referencedRelation: "architectures"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          architecture_id: string | null
          content: Json
          created_at: string
          format: string
          id: string
          project_id: string
          report_type: string
          title: string
        }
        Insert: {
          architecture_id?: string | null
          content?: Json
          created_at?: string
          format?: string
          id?: string
          project_id: string
          report_type: string
          title: string
        }
        Update: {
          architecture_id?: string | null
          content?: Json
          created_at?: string
          format?: string
          id?: string
          project_id?: string
          report_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_architecture_id_fkey"
            columns: ["architecture_id"]
            isOneToOne: false
            referencedRelation: "architectures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          additional_notes: string | null
          app_type: string
          availability_sla: number | null
          compliance: string[] | null
          created_at: string
          data_size_gb: number | null
          expected_users: number | null
          id: string
          latency_target_ms: number | null
          monthly_budget_max: number | null
          monthly_budget_min: number | null
          project_id: string
          raw_input: Json | null
          regions: string[] | null
          requests_per_second: number | null
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          app_type: string
          availability_sla?: number | null
          compliance?: string[] | null
          created_at?: string
          data_size_gb?: number | null
          expected_users?: number | null
          id?: string
          latency_target_ms?: number | null
          monthly_budget_max?: number | null
          monthly_budget_min?: number | null
          project_id: string
          raw_input?: Json | null
          regions?: string[] | null
          requests_per_second?: number | null
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          app_type?: string
          availability_sla?: number | null
          compliance?: string[] | null
          created_at?: string
          data_size_gb?: number | null
          expected_users?: number | null
          id?: string
          latency_target_ms?: number | null
          monthly_budget_max?: number | null
          monthly_budget_min?: number | null
          project_id?: string
          raw_input?: Json | null
          regions?: string[] | null
          requests_per_second?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          description: string | null
          display_name: string
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          display_name: string
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          display_name?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      service_mappings: {
        Row: {
          generic_service: string
          id: string
          notes: string | null
          provider_id: string
          provider_service: string
        }
        Insert: {
          generic_service: string
          id?: string
          notes?: string | null
          provider_id: string
          provider_service: string
        }
        Update: {
          generic_service?: string
          id?: string
          notes?: string | null
          provider_id?: string
          provider_service?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_mappings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      skus: {
        Row: {
          category_id: string
          created_at: string
          currency: string
          description: string | null
          display_name: string
          gpu_count: number | null
          gpu_memory_gb: number | null
          gpu_type: string | null
          id: string
          is_active: boolean
          memory_gb: number | null
          name: string
          price_per_hour: number
          price_per_month: number | null
          provider_id: string
          region: string
          specs: Json | null
          storage_gb: number | null
          tflops: number | null
          updated_at: string
          vcpu: number | null
        }
        Insert: {
          category_id: string
          created_at?: string
          currency?: string
          description?: string | null
          display_name: string
          gpu_count?: number | null
          gpu_memory_gb?: number | null
          gpu_type?: string | null
          id?: string
          is_active?: boolean
          memory_gb?: number | null
          name: string
          price_per_hour: number
          price_per_month?: number | null
          provider_id: string
          region: string
          specs?: Json | null
          storage_gb?: number | null
          tflops?: number | null
          updated_at?: string
          vcpu?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          display_name?: string
          gpu_count?: number | null
          gpu_memory_gb?: number | null
          gpu_type?: string | null
          id?: string
          is_active?: boolean
          memory_gb?: number | null
          name?: string
          price_per_hour?: number
          price_per_month?: number | null
          provider_id?: string
          region?: string
          specs?: Json | null
          storage_gb?: number | null
          tflops?: number | null
          updated_at?: string
          vcpu?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skus_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skus_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organizations: { Args: { _user_id: string }; Returns: string[] }
      has_org_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "member" | "viewer"
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
      app_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const
