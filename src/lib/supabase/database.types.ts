export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ScisiamUserRole = "student" | "teacher" | "admin";
export type ScisiamLabCategory = "Physics" | "Chemistry" | "Biology";
export type ScisiamLabStatus = "draft" | "ready" | "sandbox" | "archived";
export type ScisiamProgressStatus = "not_started" | "in_progress" | "completed";
export type ScisiamSubmissionStatus = "draft" | "submitted" | "reviewed" | "returned";
export type ScisiamAiMessageRole = "user" | "assistant" | "system";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: ScisiamUserRole;
          display_name: string;
          email: string | null;
          avatar_url: string | null;
          school_name: string | null;
          grade_level: string | null;
          classroom_label: string | null;
          preferred_language: string;
          total_points: number;
          current_level: number;
          xp: number;
          streak_days: number;
          onboarding_completed: boolean;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: ScisiamUserRole;
          display_name?: string;
          email?: string | null;
          avatar_url?: string | null;
          school_name?: string | null;
          grade_level?: string | null;
          classroom_label?: string | null;
          preferred_language?: string;
          total_points?: number;
          current_level?: number;
          xp?: number;
          streak_days?: number;
          onboarding_completed?: boolean;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?: ScisiamUserRole;
          display_name?: string;
          avatar_url?: string | null;
          school_name?: string | null;
          grade_level?: string | null;
          classroom_label?: string | null;
          preferred_language?: string;
          onboarding_completed?: boolean;
          last_active_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      labs: {
        Row: {
          id: string;
          title: string;
          category: ScisiamLabCategory;
          description: string;
          status: ScisiamLabStatus;
          order_index: number;
          is_active: boolean;
          simulation_path: string | null;
          detail_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      experiment_runs: {
        Row: {
          id: string;
          user_id: string;
          lab_id: string;
          status: ScisiamSubmissionStatus;
          title: string | null;
          variables: Json;
          live_values: Json;
          graph_points: Json;
          table_rows: Json;
          prediction: Json | null;
          reflection: string | null;
          summary: Json;
          score: number | null;
          points_awarded: number;
          duration_seconds: number | null;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          lab_id: string;
          status?: ScisiamSubmissionStatus;
          title?: string | null;
          variables?: Json;
          live_values?: Json;
          graph_points?: Json;
          table_rows?: Json;
          prediction?: Json | null;
          reflection?: string | null;
          summary?: Json;
          score?: number | null;
          points_awarded?: number;
          duration_seconds?: number | null;
          submitted_at?: string | null;
        };
        Update: {
          status?: ScisiamSubmissionStatus;
          title?: string | null;
          variables?: Json;
          live_values?: Json;
          graph_points?: Json;
          table_rows?: Json;
          prediction?: Json | null;
          reflection?: string | null;
          summary?: Json;
          score?: number | null;
          duration_seconds?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      lab_progress: {
        Row: {
          id: string;
          user_id: string;
          lab_id: string;
          status: ScisiamProgressStatus;
          progress_percent: number;
          attempts_count: number;
          best_score: number | null;
          last_score: number | null;
          points_awarded: number;
          last_run_id: string | null;
          last_activity_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          lab_id: string;
          status?: ScisiamProgressStatus;
          progress_percent?: number;
          attempts_count?: number;
          best_score?: number | null;
          last_score?: number | null;
          points_awarded?: number;
          last_run_id?: string | null;
          last_activity_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          status?: ScisiamProgressStatus;
          progress_percent?: number;
          attempts_count?: number;
          best_score?: number | null;
          last_score?: number | null;
          points_awarded?: number;
          last_run_id?: string | null;
          last_activity_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      mission_definitions: {
        Row: {
          id: string;
          title: string;
          description: string;
          mission_type: string;
          target_count: number;
          points_reward: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      user_mission_progress: {
        Row: {
          id: string;
          user_id: string;
          mission_id: string;
          progress_count: number;
          completed_at: string | null;
          claimed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          mission_id: string;
          progress_count?: number;
          completed_at?: string | null;
          claimed_at?: string | null;
        };
        Update: {
          progress_count?: number;
          completed_at?: string | null;
          claimed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_usage_events: {
        Row: {
          id: string;
          user_id: string | null;
          lab_id: string | null;
          provider: string;
          model: string | null;
          request_chars: number;
          response_chars: number;
          latency_ms: number | null;
          success: boolean;
          error_code: string | null;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          lab_id?: string | null;
          provider?: string;
          model?: string | null;
          request_chars?: number;
          response_chars?: number;
          latency_ms?: number | null;
          success?: boolean;
          error_code?: string | null;
        };
        Update: never;
        Relationships: [];
      };
      ai_rate_limits: {
        Row: {
          client_key: string;
          window_start: string;
          request_count: number;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      save_experiment_run: {
        Args: {
          p_lab_id: string;
          p_title?: string | null;
          p_variables?: Json;
          p_live_values?: Json;
          p_graph_points?: Json;
          p_table_rows?: Json;
          p_prediction?: Json | null;
          p_reflection?: string | null;
          p_summary?: Json;
          p_score?: number | null;
          p_duration_seconds?: number | null;
        };
        Returns: string;
      };
      claim_mission_reward: {
        Args: {
          p_mission_id: string;
          p_progress_count?: number;
        };
        Returns: Json;
      };
      check_ai_rate_limit: {
        Args: {
          p_client_key: string;
          p_window_seconds?: number;
          p_max_requests?: number;
        };
        Returns: Json;
      };
    };
    Enums: {
      scisiam_ai_message_role: ScisiamAiMessageRole;
      scisiam_lab_category: ScisiamLabCategory;
      scisiam_lab_status: ScisiamLabStatus;
      scisiam_progress_status: ScisiamProgressStatus;
      scisiam_submission_status: ScisiamSubmissionStatus;
      scisiam_user_role: ScisiamUserRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
