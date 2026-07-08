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
      camera_jobs: {
        Row: {
          address: string | null
          camera_count: number
          checklist: Json
          completed_at: string | null
          created_at: string
          customer_name: string
          customer_phone: string | null
          dvr_model: string | null
          fee: number | null
          id: string
          installments: number | null
          job_type: string
          material_cost: number | null
          notes: string | null
          paid_amount: number | null
          payment_method: string | null
          postponed_to: string | null
          promised_payment_date: string | null
          status: string
        }
        Insert: {
          address?: string | null
          camera_count?: number
          checklist?: Json
          completed_at?: string | null
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          dvr_model?: string | null
          fee?: number | null
          id?: string
          installments?: number | null
          job_type?: string
          material_cost?: number | null
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          postponed_to?: string | null
          promised_payment_date?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          camera_count?: number
          checklist?: Json
          completed_at?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          dvr_model?: string | null
          fee?: number | null
          id?: string
          installments?: number | null
          job_type?: string
          material_cost?: number | null
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          postponed_to?: string | null
          promised_payment_date?: string | null
          status?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          description: string
          expense_date: string
          id: string
          installments: number | null
          notes: string | null
          payment_method: string | null
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          installments?: number | null
          notes?: string | null
          payment_method?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          installments?: number | null
          notes?: string | null
          payment_method?: string | null
        }
        Relationships: []
      }
      material_movements: {
        Row: {
          created_at: string
          id: string
          material_id: string
          movement_type: string
          notes: string | null
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          movement_type: string
          notes?: string | null
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          movement_type?: string
          notes?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "material_movements_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          category: string | null
          created_at: string
          current_stock: number
          id: string
          location: string | null
          min_stock: number
          name: string
          notes: string | null
          supplier: string | null
          unit: string
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_stock?: number
          id?: string
          location?: string | null
          min_stock?: number
          name: string
          notes?: string | null
          supplier?: string | null
          unit?: string
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_stock?: number
          id?: string
          location?: string | null
          min_stock?: number
          name?: string
          notes?: string | null
          supplier?: string | null
          unit?: string
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      product_sales: {
        Row: {
          created_at: string
          id: string
          installments: number | null
          notes: string | null
          payment_method: string | null
          product_id: string | null
          product_name: string
          sale_date: string
          sale_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          installments?: number | null
          notes?: string | null
          payment_method?: string | null
          product_id?: string | null
          product_name: string
          sale_date?: string
          sale_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          installments?: number | null
          notes?: string | null
          payment_method?: string | null
          product_id?: string | null
          product_name?: string
          sale_date?: string
          sale_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          image_urls: string[] | null
          is_active: boolean
          name: string
          price: number | null
          sort_order: number
          stock: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean
          name: string
          price?: number | null
          sort_order?: number
          stock?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image_urls?: string[] | null
          is_active?: boolean
          name?: string
          price?: number | null
          sort_order?: number
          stock?: number
        }
        Relationships: []
      }
      service_jobs: {
        Row: {
          accessories: Json | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string
          customer_name: string
          customer_phone: string | null
          customer_surname: string
          device_name: string | null
          fee: number | null
          id: string
          installments: number | null
          material_cost: number | null
          notes: string | null
          paid_amount: number | null
          payment_method: string | null
          postponed_to: string | null
          promised_payment_date: string | null
          rustdesk_id: string | null
          service_type: string
          status: string
          steps: Json | null
          tracking_code: string
        }
        Insert: {
          accessories?: Json | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          customer_name: string
          customer_phone?: string | null
          customer_surname: string
          device_name?: string | null
          fee?: number | null
          id?: string
          installments?: number | null
          material_cost?: number | null
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          postponed_to?: string | null
          promised_payment_date?: string | null
          rustdesk_id?: string | null
          service_type?: string
          status?: string
          steps?: Json | null
          tracking_code: string
        }
        Update: {
          accessories?: Json | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          customer_name?: string
          customer_phone?: string | null
          customer_surname?: string
          device_name?: string | null
          fee?: number | null
          id?: string
          installments?: number | null
          material_cost?: number | null
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          postponed_to?: string | null
          promised_payment_date?: string | null
          rustdesk_id?: string | null
          service_type?: string
          status?: string
          steps?: Json | null
          tracking_code?: string
        }
        Relationships: []
      }
      shopping_list: {
        Row: {
          created_at: string
          estimated_cost: number | null
          id: string
          is_purchased: boolean
          item_name: string
          material_id: string | null
          notes: string | null
          priority: string
          purchased_at: string | null
          quantity: number
          supplier: string | null
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          is_purchased?: boolean
          item_name: string
          material_id?: string | null
          notes?: string | null
          priority?: string
          purchased_at?: string | null
          quantity?: number
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_cost?: number | null
          id?: string
          is_purchased?: boolean
          item_name?: string
          material_id?: string | null
          notes?: string | null
          priority?: string
          purchased_at?: string | null
          quantity?: number
          supplier?: string | null
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
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
