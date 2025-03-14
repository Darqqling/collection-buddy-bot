export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bot_config: {
        Row: {
          bot_token: string | null
          created_at: string
          id: number
          last_webhook_check: string | null
          updated_at: string
          webhook_active: boolean | null
          webhook_error: string | null
          webhook_url: string | null
        }
        Insert: {
          bot_token?: string | null
          created_at?: string
          id?: number
          last_webhook_check?: string | null
          updated_at?: string
          webhook_active?: boolean | null
          webhook_error?: string | null
          webhook_url?: string | null
        }
        Update: {
          bot_token?: string | null
          created_at?: string
          id?: number
          last_webhook_check?: string | null
          updated_at?: string
          webhook_active?: boolean | null
          webhook_error?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      fundraisers: {
        Row: {
          completed_at: string | null
          created_at: string
          creator_id: number
          creator_username: string | null
          description: string | null
          donations_count: number | null
          goal: number
          id: number
          image_url: string | null
          raised: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          creator_id: number
          creator_username?: string | null
          description?: string | null
          donations_count?: number | null
          goal: number
          id?: number
          image_url?: string | null
          raised?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          creator_id?: number
          creator_username?: string | null
          description?: string | null
          donations_count?: number | null
          goal?: number
          id?: number
          image_url?: string | null
          raised?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fundraisers_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "telegram_users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      telegram_users: {
        Row: {
          created_at: string
          first_name: string
          id: number
          is_admin: boolean | null
          is_banned: boolean | null
          last_active: string | null
          last_name: string | null
          telegram_id: number
          username: string | null
        }
        Insert: {
          created_at?: string
          first_name: string
          id?: number
          is_admin?: boolean | null
          is_banned?: boolean | null
          last_active?: string | null
          last_name?: string | null
          telegram_id: number
          username?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: number
          is_admin?: boolean | null
          is_banned?: boolean | null
          last_active?: string | null
          last_name?: string | null
          telegram_id?: number
          username?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          confirmed_at: string | null
          created_at: string
          currency: string | null
          donor_id: number
          donor_username: string | null
          fundraiser_id: number
          id: number
          notes: string | null
          payment_method: string
          rejected_at: string | null
          status: string
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          created_at?: string
          currency?: string | null
          donor_id: number
          donor_username?: string | null
          fundraiser_id: number
          id?: number
          notes?: string | null
          payment_method: string
          rejected_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          created_at?: string
          currency?: string | null
          donor_id?: number
          donor_username?: string | null
          fundraiser_id?: number
          id?: number
          notes?: string | null
          payment_method?: string
          rejected_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "telegram_users"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "transactions_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraisers"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
