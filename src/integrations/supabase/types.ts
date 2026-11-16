export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      articles: {
        Row: {
          body: string;
          created_at: string;
          filename: string;
          number: number | null;
          slug: string;
          summary: string;
          title: string;
          track: string;
          track_order: number;
          word_count: number;
        };
        Insert: {
          body: string;
          created_at?: string;
          filename: string;
          number?: number | null;
          slug: string;
          summary?: string;
          title: string;
          track: string;
          track_order?: number;
          word_count?: number;
        };
        Update: {
          body?: string;
          created_at?: string;
          filename?: string;
          number?: number | null;
          slug?: string;
          summary?: string;
          title?: string;
          track?: string;
          track_order?: number;
          word_count?: number;
        };
        Relationships: [];
      };
      coverage_deep: {
        Row: {
          depth_in_repository: string | null;
          domain: string;
          evidence_status: string | null;
          id: number;
          new_deep_volumes: string | null;
          next_validation_action: string | null;
          primary_source_anchors: string | null;
          remaining_gap: string | null;
          sort: number;
        };
        Insert: {
          depth_in_repository?: string | null;
          domain: string;
          evidence_status?: string | null;
          id?: number;
          new_deep_volumes?: string | null;
          next_validation_action?: string | null;
          primary_source_anchors?: string | null;
          remaining_gap?: string | null;
          sort?: number;
        };
        Update: {
          depth_in_repository?: string | null;
          domain?: string;
          evidence_status?: string | null;
          id?: number;
          new_deep_volumes?: string | null;
          next_validation_action?: string | null;
          primary_source_anchors?: string | null;
          remaining_gap?: string | null;
          sort?: number;
        };
        Relationships: [];
      };
      coverage_research: {
        Row: {
          coverage_status: string | null;
          domain: string;
          id: number;
          knowledge_files: string | null;
          known_limitations_or_gaps: string | null;
          sort: number;
          source_anchors: string | null;
        };
        Insert: {
          coverage_status?: string | null;
          domain: string;
          id?: number;
          knowledge_files?: string | null;
          known_limitations_or_gaps?: string | null;
          sort?: number;
          source_anchors?: string | null;
        };
        Update: {
          coverage_status?: string | null;
          domain?: string;
          id?: number;
          knowledge_files?: string | null;
          known_limitations_or_gaps?: string | null;
          sort?: number;
          source_anchors?: string | null;
        };
        Relationships: [];
      };
      learning_goals: {
        Row: {
          created_at: string;
          id: string;
          text: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          text: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          text?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      pack_meta: {
        Row: {
          key: string;
          value: Json;
        };
        Insert: {
          key: string;
          value: Json;
        };
        Update: {
          key?: string;
          value?: Json;
        };
        Relationships: [];
      };
      practice_prompts: {
        Row: {
          exercise: string;
          primary_concepts: string | null;
          prompt_id: string;
          required_artifacts: string | null;
          sort: number;
        };
        Insert: {
          exercise: string;
          primary_concepts?: string | null;
          prompt_id: string;
          required_artifacts?: string | null;
          sort?: number;
        };
        Update: {
          exercise?: string;
          primary_concepts?: string | null;
          prompt_id?: string;
          required_artifacts?: string | null;
          sort?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string;
          id: string;
          initials: string;
          signature_seed: number;
          signed_at: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string;
          id: string;
          initials?: string;
          signature_seed?: number;
          signed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          id?: string;
          initials?: string;
          signature_seed?: number;
          signed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      progress_events: {
        Row: {
          created_at: string;
          discipline: string | null;
          id: string;
          kind: string;
          occurred_on: string;
          ref: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          discipline?: string | null;
          id?: string;
          kind: string;
          occurred_on?: string;
          ref: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          discipline?: string | null;
          id?: string;
          kind?: string;
          occurred_on?: string;
          ref?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          career_level: string | null;
          competency_areas: string | null;
          id: number;
          portfolio_project: string | null;
          role: string;
          sort: number;
          source_anchors: string | null;
          typical_deliverables: string | null;
        };
        Insert: {
          career_level?: string | null;
          competency_areas?: string | null;
          id?: number;
          portfolio_project?: string | null;
          role: string;
          sort?: number;
          source_anchors?: string | null;
          typical_deliverables?: string | null;
        };
        Update: {
          career_level?: string | null;
          competency_areas?: string | null;
          id?: number;
          portfolio_project?: string | null;
          role?: string;
          sort?: number;
          source_anchors?: string | null;
          typical_deliverables?: string | null;
        };
        Relationships: [];
      };
      scrape_audit: {
        Row: {
          canonical_source_id: string | null;
          extraction_extent: string | null;
          id: number;
          limitations: string | null;
          research_ref: string | null;
          sort: number;
          status: string | null;
          title: string | null;
          tools: string | null;
          url: string | null;
        };
        Insert: {
          canonical_source_id?: string | null;
          extraction_extent?: string | null;
          id?: number;
          limitations?: string | null;
          research_ref?: string | null;
          sort?: number;
          status?: string | null;
          title?: string | null;
          tools?: string | null;
          url?: string | null;
        };
        Update: {
          canonical_source_id?: string | null;
          extraction_extent?: string | null;
          id?: number;
          limitations?: string | null;
          research_ref?: string | null;
          sort?: number;
          status?: string | null;
          title?: string | null;
          tools?: string | null;
          url?: string | null;
        };
        Relationships: [];
      };
      sources: {
        Row: {
          limitations: string | null;
          quality_signal: string | null;
          relevance: string | null;
          sort: number;
          source_id: string;
          source_type: string | null;
          title: string;
          url: string | null;
        };
        Insert: {
          limitations?: string | null;
          quality_signal?: string | null;
          relevance?: string | null;
          sort?: number;
          source_id: string;
          source_type?: string | null;
          title: string;
          url?: string | null;
        };
        Update: {
          limitations?: string | null;
          quality_signal?: string | null;
          relevance?: string | null;
          sort?: number;
          source_id?: string;
          source_type?: string | null;
          title?: string;
          url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
