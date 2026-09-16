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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      brides: {
        Row: {
          budget: number | null
          created_at: string
          guests: number | null
          id: string
          onboarded: boolean
          partner_name: string | null
          wedding_date: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string
          guests?: number | null
          id: string
          onboarded?: boolean
          partner_name?: string | null
          wedding_date?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string
          guests?: number | null
          id?: string
          onboarded?: boolean
          partner_name?: string | null
          wedding_date?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          emoji: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          emoji?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          emoji?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      contacts: {
        Row: {
          bride_id: string
          category_id: string | null
          created_at: string
          id: string
          last_contact_at: string
          notes: string | null
          status: Database["public"]["Enums"]["lead_status"]
          vendor_id: string
        }
        Insert: {
          bride_id: string
          category_id?: string | null
          created_at?: string
          id?: string
          last_contact_at?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          vendor_id: string
        }
        Update: {
          bride_id?: string
          category_id?: string | null
          created_at?: string
          id?: string
          last_contact_at?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          bride_id: string
          bride_name: string | null
          category_id: string | null
          city: string | null
          created_at: string
          id: string
          message: string | null
          state: string | null
          status: Database["public"]["Enums"]["lead_status"]
          vendor_id: string
          wedding_date: string | null
        }
        Insert: {
          bride_id: string
          bride_name?: string | null
          category_id?: string | null
          city?: string | null
          created_at?: string
          id?: string
          message?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          vendor_id: string
          wedding_date?: string | null
        }
        Update: {
          bride_id?: string
          bride_name?: string | null
          category_id?: string | null
          city?: string | null
          created_at?: string
          id?: string
          message?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          vendor_id?: string
          wedding_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          paid_at: string | null
          provider: string | null
          provider_payment_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          paid_at?: string | null
          provider?: string | null
          provider_payment_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          referral_code: string | null
          state: string | null
          type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          referral_code?: string | null
          state?: string | null
          type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string | null
          state?: string | null
          type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          status: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          approved: boolean
          comment: string | null
          created_at: string
          id: string
          rating: number
          user_id: string
          vendor_id: string
        }
        Insert: {
          approved?: boolean
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          user_id: string
          vendor_id: string
        }
        Update: {
          approved?: boolean
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: Database["public"]["Enums"]["user_type"]
          provider: string | null
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["sub_status"]
          trial_ends_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan: Database["public"]["Enums"]["user_type"]
          provider?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["sub_status"]
          trial_ends_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["user_type"]
          provider?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["sub_status"]
          trial_ends_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      vendor_categories: {
        Row: {
          category_id: string
          vendor_id: string
        }
        Insert: {
          category_id: string
          vendor_id: string
        }
        Update: {
          category_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_categories_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_events: {
        Row: {
          actor_id: string | null
          category_id: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["vendor_event_type"]
          id: string
          source: string
          vendor_id: string
        }
        Insert: {
          actor_id?: string | null
          category_id?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["vendor_event_type"]
          id?: string
          source?: string
          vendor_id: string
        }
        Update: {
          actor_id?: string | null
          category_id?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["vendor_event_type"]
          id?: string
          source?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_events_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_photos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_cover: boolean
          sort_order: number
          storage_path: string | null
          url: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path?: string | null
          url: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path?: string | null
          url?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_photos_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          price: number | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_services_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          cover_url: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          instagram: string | null
          is_demo: boolean
          logo_url: string | null
          owner_name: string | null
          portfolio_limit: number
          price_from: number | null
          price_to: number | null
          primary_category_id: string | null
          rating: number
          reviews_count: number
          slug: string
          state: string | null
          status: Database["public"]["Enums"]["vendor_status"]
          user_id: string | null
          views: number
          website: string | null
          whatsapp: string | null
          whatsapp_clicks: number
          whatsapp_message: string | null
          work_description: Json
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_demo?: boolean
          logo_url?: string | null
          owner_name?: string | null
          portfolio_limit?: number
          price_from?: number | null
          price_to?: number | null
          primary_category_id?: string | null
          rating?: number
          reviews_count?: number
          slug: string
          state?: string | null
          status?: Database["public"]["Enums"]["vendor_status"]
          user_id?: string | null
          views?: number
          website?: string | null
          whatsapp?: string | null
          whatsapp_clicks?: number
          whatsapp_message?: string | null
          work_description?: Json
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          cover_url?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_demo?: boolean
          logo_url?: string | null
          owner_name?: string | null
          portfolio_limit?: number
          price_from?: number | null
          price_to?: number | null
          primary_category_id?: string | null
          rating?: number
          reviews_count?: number
          slug?: string
          state?: string | null
          status?: Database["public"]["Enums"]["vendor_status"]
          user_id?: string | null
          views?: number
          website?: string | null
          whatsapp?: string | null
          whatsapp_clicks?: number
          whatsapp_message?: string | null
          work_description?: Json
        }
        Relationships: [
          {
            foreignKeyName: "vendors_primary_category_id_fkey"
            columns: ["primary_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_tasks: {
        Row: {
          bride_id: string
          category_id: string
          contracted_value: number | null
          created_at: string
          id: string
          notes: string | null
          paid_value: number | null
          planned_budget: number | null
          status: Database["public"]["Enums"]["task_status"]
          vendor_id: string | null
        }
        Insert: {
          bride_id: string
          category_id: string
          contracted_value?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_value?: number | null
          planned_budget?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          vendor_id?: string | null
        }
        Update: {
          bride_id?: string
          category_id?: string
          contracted_value?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_value?: number | null
          planned_budget?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wedding_tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_tasks_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
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
      track_vendor_event: {
        Args: {
          _category_id?: string
          _event_type: Database["public"]["Enums"]["vendor_event_type"]
          _source?: string
          _vendor_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "bride" | "vendor"
      lead_status: "novo" | "contatado" | "negociacao" | "fechado" | "perdido"
      sub_status: "trialing" | "active" | "past_due" | "canceled" | "none"
      task_status:
        | "nao_iniciado"
        | "pesquisando"
        | "contato"
        | "negociacao"
        | "contratado"
      user_type: "bride" | "vendor"
      vendor_event_type:
        | "profile_view"
        | "favorite"
        | "budget_request"
        | "whatsapp_click"
        | "lead_created"
      vendor_status: "pendente" | "aprovado" | "rejeitado" | "suspenso"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "bride", "vendor"],
      lead_status: ["novo", "contatado", "negociacao", "fechado", "perdido"],
      sub_status: ["trialing", "active", "past_due", "canceled", "none"],
      task_status: [
        "nao_iniciado",
        "pesquisando",
        "contato",
        "negociacao",
        "contratado",
      ],
      user_type: ["bride", "vendor"],
      vendor_event_type: [
        "profile_view",
        "favorite",
        "budget_request",
        "whatsapp_click",
        "lead_created",
      ],
      vendor_status: ["pendente", "aprovado", "rejeitado", "suspenso"],
    },
  },
} as const
