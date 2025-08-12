
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Type aliases for commonly used table types
export type BullRoom = Tables<'bull_rooms'>
export type Article = Tables<'articles'>
export type Author = Tables<'authors'>
export type Brief = Tables<'briefs'>
export type Category = Tables<'categories'>
export type Tag = Tables<'tags'>
export type UserProfile = Tables<'user_profiles'>
export type ArticleComment = Tables<'article_comments'>
export type ArticleView = Tables<'article_views'>
export type BriefView = Tables<'brief_views'>
export type Bookmark = Tables<'bookmarks'>
export type BullRoomMessage = Tables<'bull_room_messages'>
export type BullRoomReaction = Tables<'bull_room_reactions'>
export type CommentReaction = Tables<'comment_reactions'>
export type ArticleTag = Tables<'article_tags'>
export type AIPrompt = Tables<'ai_prompts'>
export type AIPromptCategory = Tables<'ai_prompt_categories'>
export type PromptField = Tables<'prompt_fields'>
export type Role = Tables<'roles'>
export type UserRole = Tables<'user_roles'>
export type ProfileOperationLog = Tables<'profile_operation_logs'>
export type BullRoomsStats = Tables<'bull_rooms_stats'>

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_prompt_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_prompts: {
        Row: {
          category_id: string
          content: string
          created_at: string | null
          description: string
          id: string
          intended_llm: string
          original_credit: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string | null
          description: string
          id?: string
          intended_llm: string
          original_credit: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string | null
          description?: string
          id?: string
          intended_llm?: string
          original_credit?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ai_prompt_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      article_comments: {
        Row: {
          article_id: string
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          parent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "article_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_tags: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          tag_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          tag_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      article_views: {
        Row: {
          article_id: string | null
          id: string
          ip_address: unknown | null
          referrer: string | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          article_id?: string | null
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          article_id?: string | null
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          bookmark_count: number | null
          category_id: string | null
          comment_count: number | null
          content: string
          created_at: string | null
          featured: boolean | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          premium: boolean | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          status: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          bookmark_count?: number | null
          category_id?: string | null
          comment_count?: number | null
          content: string
          created_at?: string | null
          featured?: boolean | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          premium?: boolean | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          status?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          bookmark_count?: number | null
          category_id?: string | null
          comment_count?: number | null
          content?: string
          created_at?: string | null
          featured?: boolean | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          premium?: boolean | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          status?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          article_count: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          featured: boolean | null
          id: string
          linkedin_url: string | null
          name: string
          slug: string
          total_views: number | null
          twitter_handle: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          article_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          linkedin_url?: string | null
          name: string
          slug: string
          total_views?: number | null
          twitter_handle?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          article_count?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          linkedin_url?: string | null
          name?: string
          slug?: string
          total_views?: number | null
          twitter_handle?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          article_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      brief_views: {
        Row: {
          brief_id: string | null
          id: string
          ip_address: unknown | null
          referrer: string | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          brief_id?: string | null
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          brief_id?: string | null
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brief_views_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
        ]
      }
      briefs: {
        Row: {
          company_logo_url: string | null
          company_name: string | null
          content: string
          created_at: string | null
          disclaimer: string | null
          featured: boolean | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          investor_deck_url: string | null
          reading_time_minutes: number | null
          show_cta: boolean | null
          slug: string
          sponsored: boolean | null
          status: string | null
          subtitle: string | null
          tickers: Json | null
          title: string
          updated_at: string | null
          video_url: string | null
          view_count: number | null
          widget_code: string | null
        }
        Insert: {
          company_logo_url?: string | null
          company_name?: string | null
          content: string
          created_at?: string | null
          disclaimer?: string | null
          featured?: boolean | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          investor_deck_url?: string | null
          reading_time_minutes?: number | null
          show_cta?: boolean | null
          slug: string
          sponsored?: boolean | null
          status?: string | null
          subtitle?: string | null
          tickers?: Json | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
          widget_code?: string | null
        }
        Update: {
          company_logo_url?: string | null
          company_name?: string | null
          content?: string
          created_at?: string | null
          disclaimer?: string | null
          featured?: boolean | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          investor_deck_url?: string | null
          reading_time_minutes?: number | null
          show_cta?: boolean | null
          slug?: string
          sponsored?: boolean | null
          status?: string | null
          subtitle?: string | null
          tickers?: Json | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          view_count?: number | null
          widget_code?: string | null
        }
        Relationships: []
      }
      bull_room_messages: {
        Row: {
          content: string
          created_at: string | null
          edited_at: string | null
          file_data: Json | null
          id: string
          is_edited: boolean | null
          message_type: string | null
          reactions: Json | null
          reply_to_id: string | null
          room_id: string
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          content: string
          created_at?: string | null
          edited_at?: string | null
          file_data?: Json | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          reactions?: Json | null
          reply_to_id?: string | null
          room_id: string
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          content?: string
          created_at?: string | null
          edited_at?: string | null
          file_data?: Json | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          reactions?: Json | null
          reply_to_id?: string | null
          room_id?: string
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "bull_room_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "bull_room_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bull_room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "bull_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bull_room_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "bull_rooms_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bull_room_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bull_room_reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bull_room_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "bull_room_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bull_room_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bull_rooms: {
        Row: {
          banner_photo_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          last_activity_at: string | null
          message_count: number | null
          name: string
          slug: string
          sort_order: number | null
          topic: string
          updated_at: string | null
        }
        Insert: {
          banner_photo_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          last_activity_at?: string | null
          message_count?: number | null
          name: string
          slug: string
          sort_order?: number | null
          topic: string
          updated_at?: string | null
        }
        Update: {
          banner_photo_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          last_activity_at?: string | null
          message_count?: number | null
          name?: string
          slug?: string
          sort_order?: number | null
          topic?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          article_count: number | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          article_count?: number | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          article_count?: number | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "article_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_operation_logs: {
        Row: {
          details: Json | null
          id: string
          operation: string
          operation_time: string | null
          profile_id: string | null
          user_id: string | null
        }
        Insert: {
          details?: Json | null
          id?: string
          operation: string
          operation_time?: string | null
          profile_id?: string | null
          user_id?: string | null
        }
        Update: {
          details?: Json | null
          id?: string
          operation?: string
          operation_time?: string | null
          profile_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      prompt_fields: {
        Row: {
          created_at: string | null
          field_type: string
          id: string
          label: string
          options: string[] | null
          placeholder: string
          prompt_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          field_type?: string
          id?: string
          label: string
          options?: string[] | null
          placeholder: string
          prompt_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          field_type?: string
          id?: string
          label?: string
          options?: string[] | null
          placeholder?: string
          prompt_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_fields_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          article_count: number | null
          created_at: string | null
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          article_count?: number | null
          created_at?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          article_count?: number | null
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          is_admin: boolean | null
          newsletter_subscribed: boolean | null
          notification_preferences: Json | null
          preferences: Json | null
          subscription_tier: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          id: string
          is_admin?: boolean | null
          newsletter_subscribed?: boolean | null
          notification_preferences?: Json | null
          preferences?: Json | null
          subscription_tier?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          is_admin?: boolean | null
          newsletter_subscribed?: boolean | null
          notification_preferences?: Json | null
          preferences?: Json | null
          subscription_tier?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      bull_rooms_stats: {
        Row: {
          id: string | null
          last_activity_at: string | null
          message_count: number | null
          name: string | null
          recent_message_count: number | null
          slug: string | null
        }
        Insert: {
          id?: string | null
          last_activity_at?: string | null
          message_count?: number | null
          name?: string | null
          recent_message_count?: never
          slug?: string | null
        }
        Update: {
          id?: string | null
          last_activity_at?: string | null
          message_count?: number | null
          name?: string | null
          recent_message_count?: never
          slug?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_missing_user_profiles: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_personalized_articles: {
        Args: { user_uuid: string; limit_count?: number }
        Returns: {
          article_id: string
          title: string
          subtitle: string
          category_name: string
          author_name: string
          published_at: string
          view_count: number
          relevance_score: number
        }[]
      }
      get_user_preferences: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_user_profile_basic: {
        Args: { user_id: string }
        Returns: {
          id: string
          username: string
          created_at: string
          updated_at: string
        }[]
      }
      get_user_profile_by_email: {
        Args: { user_email: string }
        Returns: {
          id: string
          email: string
          username: string
          email_verified: boolean
          subscription_tier: string
          newsletter_subscribed: boolean
          preferences: Json
          created_at: string
          updated_at: string
        }[]
      }
      get_user_profiles_basic: {
        Args: { user_ids: string[] }
        Returns: {
          id: string
          username: string
          created_at: string
          updated_at: string
        }[]
      }
      get_user_roles: {
        Args: { user_uuid: string }
        Returns: {
          role_name: string
          permissions: Json
        }[]
      }
      log_profile_operation: {
        Args: {
          operation: string
          user_id?: string
          profile_id?: string
          details?: Json
        }
        Returns: undefined
      }
      should_count_brief_view: {
        Args: {
          p_brief_id: string
          p_ip_address: string
          p_user_id?: string
          p_time_window?: unknown
        }
        Returns: boolean
      }
      should_count_view: {
        Args: {
          p_article_id: string
          p_ip_address: string
          p_user_id?: string
          p_time_window?: unknown
        }
        Returns: boolean
      }
      sync_all_bookmark_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_all_brief_view_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_all_comment_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_all_view_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_preferences: {
        Args: { user_uuid: string; new_preferences: Json }
        Returns: boolean
      }
      user_has_permission: {
        Args: { user_uuid: string; resource: string; action: string }
        Returns: boolean
      }
      user_has_role: {
        Args: { user_uuid: string; role_name: string }
        Returns: boolean
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
