/**
 * Generated from the Supabase project schema (`mcp__Supabase__generate_typescript_types`).
 * Regenerate after any migration under supabase/migrations rather than hand-editing.
 */
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
      data_sources: {
        Row: {
          agency: string | null
          category: string | null
          created_at: string
          data_format: string | null
          description: string | null
          download_url: string | null
          gis_api_url: string | null
          id: number
          last_updated_label: string | null
          license: string | null
          methodology: string | null
          name: string
          quality: string | null
          reliability_note: string | null
          state_code: string | null
          updated_at: string
          url: string
        }
        Insert: {
          agency?: string | null
          category?: string | null
          created_at?: string
          data_format?: string | null
          description?: string | null
          download_url?: string | null
          gis_api_url?: string | null
          id?: number
          last_updated_label?: string | null
          license?: string | null
          methodology?: string | null
          name: string
          quality?: string | null
          reliability_note?: string | null
          state_code?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          agency?: string | null
          category?: string | null
          created_at?: string
          data_format?: string | null
          description?: string | null
          download_url?: string | null
          gis_api_url?: string | null
          id?: number
          last_updated_label?: string | null
          license?: string | null
          methodology?: string | null
          name?: string
          quality?: string | null
          reliability_note?: string | null
          state_code?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_sources_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      existing_data_centers: {
        Row: {
          acres: number | null
          campus: string | null
          city: string | null
          cloud_provider: string | null
          created_at: string
          estimated_mw: number | null
          id: number
          known_mw: number | null
          latitude: number
          longitude: number
          mw_confidence: string
          name: string
          notes: string | null
          opening_date: string | null
          operator: string | null
          source_id: number | null
          square_footage: number | null
          state_code: string
          status: string | null
          updated_at: string
        }
        Insert: {
          acres?: number | null
          campus?: string | null
          city?: string | null
          cloud_provider?: string | null
          created_at?: string
          estimated_mw?: number | null
          id?: number
          known_mw?: number | null
          latitude: number
          longitude: number
          mw_confidence?: string
          name: string
          notes?: string | null
          opening_date?: string | null
          operator?: string | null
          source_id?: number | null
          square_footage?: number | null
          state_code: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          acres?: number | null
          campus?: string | null
          city?: string | null
          cloud_provider?: string | null
          created_at?: string
          estimated_mw?: number | null
          id?: number
          known_mw?: number | null
          latitude?: number
          longitude?: number
          mw_confidence?: string
          name?: string
          notes?: string | null
          opening_date?: string | null
          operator?: string | null
          source_id?: number | null
          square_footage?: number | null
          state_code?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "existing_data_centers_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "existing_data_centers_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      grid_hourly_generation: {
        Row: {
          created_at: string
          fuel_type: string | null
          generation_mwh: number | null
          id: number
          region: string
          source_id: number | null
          timestamp_utc: string
        }
        Insert: {
          created_at?: string
          fuel_type?: string | null
          generation_mwh?: number | null
          id?: number
          region: string
          source_id?: number | null
          timestamp_utc: string
        }
        Update: {
          created_at?: string
          fuel_type?: string | null
          generation_mwh?: number | null
          id?: number
          region?: string
          source_id?: number | null
          timestamp_utc?: string
        }
        Relationships: [
          {
            foreignKeyName: "grid_hourly_generation_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      hazards: {
        Row: {
          created_at: string
          description: string | null
          hazard_type: string
          id: number
          risk_level: string
          source_id: number | null
          state_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          hazard_type: string
          id?: number
          risk_level: string
          source_id?: number | null
          state_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          hazard_type?: string
          id?: number
          risk_level?: string
          source_id?: number | null
          state_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hazards_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hazards_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      incentives: {
        Row: {
          category: string
          created_at: string
          date_verified: string
          description: string | null
          effective_date: string | null
          eligibility_notes: string | null
          eligible_counties: string[] | null
          expiry_date: string | null
          id: number
          source_id: number | null
          state_code: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          date_verified: string
          description?: string | null
          effective_date?: string | null
          eligibility_notes?: string | null
          eligible_counties?: string[] | null
          expiry_date?: string | null
          id?: number
          source_id?: number | null
          state_code: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          date_verified?: string
          description?: string | null
          effective_date?: string | null
          eligibility_notes?: string | null
          eligible_counties?: string[] | null
          expiry_date?: string | null
          id?: number
          source_id?: number | null
          state_code?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incentives_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incentives_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      research_facts: {
        Row: {
          as_of_date: string | null
          created_at: string
          fact_key: string
          id: number
          label: string
          notes: string | null
          section_number: number
          section_title: string
          source_id: number | null
          state_code: string
          unit: string | null
          updated_at: string
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          as_of_date?: string | null
          created_at?: string
          fact_key: string
          id?: number
          label: string
          notes?: string | null
          section_number: number
          section_title: string
          source_id?: number | null
          state_code: string
          unit?: string | null
          updated_at?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          as_of_date?: string | null
          created_at?: string
          fact_key?: string
          id?: number
          label?: string
          notes?: string | null
          section_number?: number
          section_title?: string
          source_id?: number | null
          state_code?: string
          unit?: string | null
          updated_at?: string
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_facts_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_facts_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      scenario_analyses: {
        Row: {
          development: Json | null
          fiber: Json | null
          gaps: Json | null
          generated_at: string
          id: number
          land: Json | null
          power: Json | null
          regulation: Json | null
          scenario_id: string
          water: Json | null
        }
        Insert: {
          development?: Json | null
          fiber?: Json | null
          gaps?: Json | null
          generated_at?: string
          id?: number
          land?: Json | null
          power?: Json | null
          regulation?: Json | null
          scenario_id: string
          water?: Json | null
        }
        Update: {
          development?: Json | null
          fiber?: Json | null
          gaps?: Json | null
          generated_at?: string
          id?: number
          land?: Json | null
          power?: Json | null
          regulation?: Json | null
          scenario_id?: string
          water?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "scenario_analyses_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          acreage_override: number | null
          buildings: number
          client_id: string | null
          cooling_medium: string
          cooling_technology: string
          created_at: string
          id: string
          label: string
          lat: number
          lng: number
          loop_type: string
          mw_load: number
          redundancy: string
          state_code: string
        }
        Insert: {
          acreage_override?: number | null
          buildings?: number
          client_id?: string | null
          cooling_medium: string
          cooling_technology: string
          created_at?: string
          id?: string
          label: string
          lat: number
          lng: number
          loop_type: string
          mw_load: number
          redundancy: string
          state_code: string
        }
        Update: {
          acreage_override?: number | null
          buildings?: number
          client_id?: string | null
          cooling_medium?: string
          cooling_technology?: string
          created_at?: string
          id?: string
          label?: string
          lat?: number
          lng?: number
          loop_type?: string
          mw_load?: number
          redundancy?: string
          state_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenarios_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      state_annual_electricity: {
        Row: {
          carbon_intensity_gco2e_per_kwh: number | null
          created_at: string
          emissions_mtco2e: number | null
          generation_twh: number | null
          id: number
          source_id: number | null
          state_code: string
          year: number
        }
        Insert: {
          carbon_intensity_gco2e_per_kwh?: number | null
          created_at?: string
          emissions_mtco2e?: number | null
          generation_twh?: number | null
          id?: number
          source_id?: number | null
          state_code: string
          year: number
        }
        Update: {
          carbon_intensity_gco2e_per_kwh?: number | null
          created_at?: string
          emissions_mtco2e?: number | null
          generation_twh?: number | null
          id?: number
          source_id?: number | null
          state_code?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "state_annual_electricity_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "state_annual_electricity_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      states: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
      utilities: {
        Row: {
          created_at: string
          distribution_utility: string | null
          id: number
          is_balancing_authority: boolean
          large_load_contact: string | null
          large_load_notes: string | null
          large_load_process_url: string | null
          name: string
          notes: string | null
          service_territory_source_id: number | null
          state_code: string
          transmission_owner: string | null
          updated_at: string
          utility_type: string | null
          website: string | null
        }
        Insert: {
          created_at?: string
          distribution_utility?: string | null
          id?: number
          is_balancing_authority?: boolean
          large_load_contact?: string | null
          large_load_notes?: string | null
          large_load_process_url?: string | null
          name: string
          notes?: string | null
          service_territory_source_id?: number | null
          state_code: string
          transmission_owner?: string | null
          updated_at?: string
          utility_type?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string
          distribution_utility?: string | null
          id?: number
          is_balancing_authority?: boolean
          large_load_contact?: string | null
          large_load_notes?: string | null
          large_load_process_url?: string | null
          name?: string
          notes?: string | null
          service_territory_source_id?: number | null
          state_code?: string
          transmission_owner?: string | null
          updated_at?: string
          utility_type?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "utilities_service_territory_source_id_fkey"
            columns: ["service_territory_source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "utilities_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      zoning_jurisdictions: {
        Row: {
          county: string
          created_at: string
          data_center_allowed: string
          date_researched: string | null
          id: number
          municipality: string | null
          notes: string | null
          source_id: number | null
          state_code: string
          updated_at: string
          zoning_district: string | null
        }
        Insert: {
          county: string
          created_at?: string
          data_center_allowed?: string
          date_researched?: string | null
          id?: number
          municipality?: string | null
          notes?: string | null
          source_id?: number | null
          state_code: string
          updated_at?: string
          zoning_district?: string | null
        }
        Update: {
          county?: string
          created_at?: string
          data_center_allowed?: string
          date_researched?: string | null
          id?: number
          municipality?: string | null
          notes?: string | null
          source_id?: number | null
          state_code?: string
          updated_at?: string
          zoning_district?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zoning_jurisdictions_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zoning_jurisdictions_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
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
    Enums: {},
  },
} as const
