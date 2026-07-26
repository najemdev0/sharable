// Auto-generated types for Supabase database schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          is_public: boolean
          followers_count: number
          following_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          is_public?: boolean
          followers_count?: number
          following_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          is_public?: boolean
          followers_count?: number
          following_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          created_by: string
          name: string
          slug: string
          description: string | null
          avatar_url: string | null
          cover_url: string | null
          members_count: number
          is_private: boolean
          rules: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by: string
          name: string
          slug: string
          description?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          members_count?: number
          is_private?: boolean
          rules?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_by?: string
          name?: string
          slug?: string
          description?: string | null
          avatar_url?: string | null
          cover_url?: string | null
          members_count?: number
          is_private?: boolean
          rules?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      community_members: {
        Row: {
          id: string
          community_id: string
          profile_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          community_id: string
          profile_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          profile_id?: string
          role?: string
          joined_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          community_id: string | null
          title: string
          content: string
          image_url: string | null
          likes_count: number
          comments_count: number
          shares_count: number
          is_pinned: boolean
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          community_id?: string | null
          title: string
          content: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          is_pinned?: boolean
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          community_id?: string | null
          title?: string
          content?: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          is_pinned?: boolean
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          parent_comment_id: string | null
          content: string
          likes_count: number
          is_edited: boolean
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          parent_comment_id?: string | null
          content: string
          likes_count?: number
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          parent_comment_id?: string | null
          content?: string
          likes_count?: number
          is_edited?: boolean
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          profile_id: string
          post_id: string | null
          comment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          post_id?: string | null
          comment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          post_id?: string | null
          comment_id?: string | null
          created_at?: string
        }
      }
      followers: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      shares: {
        Row: {
          id: string
          post_id: string
          shared_by: string
          share_type: string
          shared_with: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          shared_by: string
          share_type?: string
          shared_with?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          shared_by?: string
          share_type?: string
          shared_with?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          triggered_by: string | null
          type: string
          post_id: string | null
          comment_id: string | null
          message: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          triggered_by?: string | null
          type: string
          post_id?: string | null
          comment_id?: string | null
          message?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          triggered_by?: string | null
          type?: string
          post_id?: string | null
          comment_id?: string | null
          message?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          content: string
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          content: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
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

export type Tables<PublicTableNameOrOptions extends
  | keyof Database['public']['Tables']
  | { schema: keyof Database }> =
  PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][keyof Database[PublicTableNameOrOptions['schema']]['Tables']]
    : PublicTableNameOrOptions extends keyof Database['public']['Tables']
      ? Database['public']['Tables'][PublicTableNameOrOptions]
      : never
