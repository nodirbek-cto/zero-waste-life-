export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ProfileRole = "user" | "admin"
export type ReportStatus = "pending" | "reviewed" | "resolved"
export type ScanStatus = "pending" | "done"

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          points: number
          role: ProfileRole
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          points?: number
          role?: ProfileRole
          created_at?: string
        }
        Update: {
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          points?: number
          role?: ProfileRole
          created_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          image_url: string | null
          status: ReportStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          image_url?: string | null
          status?: ReportStatus
          created_at?: string
        }
        Update: {
          title?: string
          description?: string
          image_url?: string | null
          status?: ReportStatus
          created_at?: string
        }
        Relationships: []
      }
      scan_results: {
        Row: {
          id: string
          user_id: string
          image_url: string
          result_text: string | null
          status: ScanStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          result_text?: string | null
          status?: ScanStatus
          created_at?: string
        }
        Update: {
          image_url?: string
          result_text?: string | null
          status?: ScanStatus
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          image_url?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          description?: string
          price?: number
          image_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          created_at?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          id: string
          name: string
          description: string
          latitude: number
          longitude: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          latitude: number
          longitude: number
          created_at?: string
        }
        Update: {
          name?: string
          description?: string
          latitude?: number
          longitude?: number
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          metadata?: Json | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      buy_product: {
        Args: {
          p_user_id: string
          p_product_id: string
        }
        Returns: {
          purchase_id: string
          points_remaining: number
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type Inserts<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type Updates<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
