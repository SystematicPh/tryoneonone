export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      point_settings: {
        Row: {
          amount_per_point: number;
          created_at: string;
          id: number;
          points_per_amount: number;
          updated_at: string;
        };
        Insert: {
          amount_per_point?: number;
          created_at?: string;
          id?: number;
          points_per_amount?: number;
          updated_at?: string;
        };
        Update: {
          amount_per_point?: number;
          created_at?: string;
          id?: number;
          points_per_amount?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      point_transactions: {
        Row: {
          admin_id: string | null;
          amount_spent: number;
          created_at: string;
          id: string;
          notes: string | null;
          points_awarded: number;
          user_id: string;
        };
        Insert: {
          admin_id?: string | null;
          amount_spent?: number;
          created_at?: string;
          id?: string;
          notes?: string | null;
          points_awarded?: number;
          user_id: string;
        };
        Update: {
          admin_id?: string | null;
          amount_spent?: number;
          created_at?: string;
          id?: string;
          notes?: string | null;
          points_awarded?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          role: "admin" | "customer";
          total_points: number;
          username: string;
        };
        Insert: {
          created_at?: string;
          full_name: string;
          id: string;
          role?: "admin" | "customer";
          total_points?: number;
          username: string;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
          role?: "admin" | "customer";
          total_points?: number;
          username?: string;
        };
        Relationships: [];
      };
      reward_redemptions: {
        Row: {
          created_at: string;
          id: string;
          points_spent: number;
          reward_id: string;
          reward_name_snapshot: string;
          status: "pending" | "claimed" | "cancelled";
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          points_spent: number;
          reward_id: string;
          reward_name_snapshot: string;
          status?: "pending" | "claimed" | "cancelled";
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          points_spent?: number;
          reward_id?: string;
          reward_name_snapshot?: string;
          status?: "pending" | "claimed" | "cancelled";
          user_id?: string;
        };
        Relationships: [];
      };
      rewards: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          image_emoji: string;
          is_active: boolean;
          points_cost: number;
          stock: number | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          image_emoji?: string;
          is_active?: boolean;
          points_cost: number;
          stock?: number | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          image_emoji?: string;
          is_active?: boolean;
          points_cost?: number;
          stock?: number | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      leaderboard: {
        Row: {
          full_name: string | null;
          rank_number: number | null;
          total_points: number | null;
          username: string | null;
        };
      };
    };
    Functions: {
      add_purchase_points: {
        Args: {
          purchase_amount: number;
          target_username: string;
          acting_admin_id: string;
          notes_input?: string;
        };
        Returns: Json;
      };
      claim_reward: {
        Args: {
          reward_id_input: string;
        };
        Returns: Json;
      };
    };
  };
};
