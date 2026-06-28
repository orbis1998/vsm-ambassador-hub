/**
 * Types Supabase — alignés sur docs/AUDIT_DB.md + migrations Academy.
 * Régénérer après exécution des migrations si le schéma évolue.
 */
export type { AmbassadorProfile, ProfileRow, AmbassadorPublic } from "./profile";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: string;
          name: string | null;
          phone: string | null;
          email: string | null;
          email_verified: boolean | null;
          phone_verified: boolean | null;
          full_name: string | null;
          created_at: string | null;
          updated_at: string | null;
          badge: string | null;
          handle: string | null;
          avatar_url: string | null;
          bio: string | null;
          country: string | null;
          xp: number;
          points: number;
          level: string;
          academy_progress: number;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      academy_notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          actor_id: string | null;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["academy_notifications"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["academy_notifications"]["Row"]>;
        Relationships: [];
      };
      academy_push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          channels: string[];
          created_at: string;
        };
        Insert: {
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          channels?: string[];
        };
        Update: Partial<Database["public"]["Tables"]["academy_push_subscriptions"]["Row"]>;
        Relationships: [];
      };
      academy_courses: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
      academy_lessons: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
      academy_quizzes: {
        Row: {
          id: string;
          lesson_id: string | null;
          course_id: string | null;
          title: string;
          passing_score: number;
          questions: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["academy_quizzes"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["academy_quizzes"]["Row"]>;
        Relationships: [];
      };
      academy_course_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          progress_percent: number;
          completed_at: string | null;
          last_lesson_id: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["academy_course_progress"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["academy_course_progress"]["Row"]>;
        Relationships: [];
      };
      academy_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          watch_seconds: number;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["academy_lesson_progress"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["academy_lesson_progress"]["Row"]>;
        Relationships: [];
      };
      academy_quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          score: number;
          passed: boolean;
          answers: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["academy_quiz_attempts"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["academy_quiz_attempts"]["Row"]>;
        Relationships: [];
      };
      academy_resources: {
        Row: {
          id: string;
          title: string;
          category: string;
          file_url: string;
          thumbnail_url: string | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["academy_resources"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["academy_resources"]["Row"]>;
        Relationships: [];
      };
      academy_favorites: {
        Row: {
          user_id: string;
          course_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["academy_favorites"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["academy_favorites"]["Row"]>;
        Relationships: [];
      };
      academy_conversations: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
      academy_messages: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
      social_posts: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
      social_stories: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
      social_comments: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
      social_groups: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
      academy_opportunities: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
      academy_challenges: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
      academy_certificates: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
      user_roles: { Row: { user_id: string; role: string }; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
      ambassador_links: {
        Row: {
          id: number;
          ambassador_id: string;
          promo_code_id: number | null;
          target_type: string | null;
          target_product_id: number | null;
          slug: string;
          created_at: string | null;
          active: boolean | null;
        };
        Insert: Partial<Database["public"]["Tables"]["ambassador_links"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["ambassador_links"]["Row"]>;
        Relationships: [];
      };
      ambassador_applications: {
        Row: {
          id: number;
          full_name: string | null;
          phone: string | null;
          username: string | null;
          email: string | null;
          user_id: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["ambassador_applications"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["ambassador_applications"]["Row"]>;
        Relationships: [];
      };
      push_outbox: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
    };
    Views: {
      academy_leaderboard: {
        Row: {
          id: string;
          name: string;
          handle: string;
          badge: string;
          avatar_url: string;
          level: string;
          xp: number;
          points: number;
          country: string;
          rank: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      resolve_ambassador_login: {
        Args: { identifier: string };
        Returns: { email: string; user_id: string }[];
      };
      is_ambassador: {
        Args: { p_user_id?: string };
        Returns: boolean;
      };
      get_ambassador_program_tier: {
        Args: { p_user_id?: string };
        Returns: string;
      };
      get_ambassador_program_profile: {
        Args: { p_user_id?: string };
        Returns: Json;
      };
      ambassador_confirmed_sales_count: {
        Args: { _uid: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
