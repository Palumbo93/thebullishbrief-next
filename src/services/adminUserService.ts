/**
 * Admin User Service
 * 
 * Provides comprehensive user information queries for admin portal
 * including user activity, analytics, and detailed profile data.
 */

import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Create a service role client for admin operations
const createServiceRoleClient = () => {
  if (typeof window !== 'undefined') {
    // On client side, use regular supabase client (admin policies will handle access)
    return supabase;
  }
  
  // On server side, use service role if available
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  
  // Fallback to regular client
  return supabase;
};

export interface UserActivityStats {
  article_views: number;
  brief_views: number;
  bookmarks: number;
  bull_room_messages: number;
  bull_room_reactions: number;
  comments: number;
  total_reading_time_minutes: number;
  last_activity_at: string | null;
}

export interface UserRestrictions {
  id: string;
  restriction_type: string;
  reason: string | null;
  expires_at: string | null;
  created_at: string;
  restricted_by_email: string;
}

export interface ComprehensiveUserInfo {
  // Basic profile info
  id: string;
  email: string;
  username: string;
  bio: string | null;
  profile_image: string | null;
  twitter_handle: string | null;
  
  // Account status
  is_admin: boolean | null;
  email_verified: boolean | null;
  newsletter_subscribed: boolean | null;
  subscription_tier: string | null;
  
  // Preferences and metadata
  preferences: any;
  notification_preferences: any;
  
  // Timestamps
  created_at: string;
  updated_at: string | null;
  
  // Activity statistics
  activity_stats: UserActivityStats;
  
  // Restrictions (if any)
  restrictions: UserRestrictions[];
  
  // Recent activity samples
  recent_article_views: Array<{
    article_title: string;
    viewed_at: string;
    reading_time_seconds: number | null;
  }>;
  
  recent_brief_views: Array<{
    brief_title: string;
    viewed_at: string;
  }>;
  
  recent_bookmarks: Array<{
    article_title: string;
    created_at: string;
  }>;
  
  recent_bull_room_activity: Array<{
    room_name: string;
    message_content: string;
    created_at: string;
    type: 'message' | 'reaction';
  }>;
}

export class AdminUserService {
  /**
   * Get comprehensive user information for admin view
   */
  static async getUserInfo(userId: string): Promise<ComprehensiveUserInfo> {
    try {
      const client = createServiceRoleClient();
      
      // Get basic user profile
      const { data: profile, error: profileError } = await client
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('User not found');

      // Get activity statistics
      const activityStats = await this.getUserActivityStats(userId);
      
      // Get user restrictions
      const restrictions = await this.getUserRestrictions(userId);
      
      // Get recent activity samples
      const [recentArticleViews, recentBriefViews, recentBookmarks, recentBullRoomActivity] = 
        await Promise.all([
          this.getRecentArticleViews(userId),
          this.getRecentBriefViews(userId),
          this.getRecentBookmarks(userId),
          this.getRecentBullRoomActivity(userId)
        ]);

      return {
        ...profile,
        activity_stats: activityStats,
        restrictions,
        recent_article_views: recentArticleViews,
        recent_brief_views: recentBriefViews,
        recent_bookmarks: recentBookmarks,
        recent_bull_room_activity: recentBullRoomActivity
      };
    } catch (error) {
      throw new Error(`Failed to fetch comprehensive user info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user activity statistics
   */
  private static async getUserActivityStats(userId: string): Promise<UserActivityStats> {
    try {
      const client = createServiceRoleClient();
      
      const [
        articleViewsResult,
        briefViewsResult,
        bookmarksResult,
        messagesResult,
        reactionsResult,
        commentsResult,
        readingTimeResult
      ] = await Promise.all([
        // Article views count
        client
          .from('article_views')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        
        // Brief views count
        client
          .from('brief_views')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        
        // Bookmarks count
        client
          .from('bookmarks')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        
        // Bull room messages count
        client
          .from('bull_room_messages')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        
        // Bull room reactions count
        client
          .from('bull_room_reactions')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        
        // Article comments count (if table exists)
        client
          .from('article_comments')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        
        // Total reading time
        client
          .from('article_views')
          .select('reading_time_seconds')
          .eq('user_id', userId)
          .not('reading_time_seconds', 'is', null)
      ]);

      // Get last activity timestamp
      const { data: lastActivity } = await client
        .from('article_views')
        .select('viewed_at')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(1)
        .single();

      // Calculate total reading time in minutes
      const totalReadingTimeSeconds = readingTimeResult.data?.reduce(
        (total, view) => total + (view.reading_time_seconds || 0), 
        0
      ) || 0;

      return {
        article_views: articleViewsResult.count || 0,
        brief_views: briefViewsResult.count || 0,
        bookmarks: bookmarksResult.count || 0,
        bull_room_messages: messagesResult.count || 0,
        bull_room_reactions: reactionsResult.count || 0,
        comments: commentsResult.count || 0,
        total_reading_time_minutes: Math.round(totalReadingTimeSeconds / 60),
        last_activity_at: lastActivity?.viewed_at || null
      };
    } catch (error) {
      console.error('Error fetching user activity stats:', error);
      // Return default stats if there's an error
      return {
        article_views: 0,
        brief_views: 0,
        bookmarks: 0,
        bull_room_messages: 0,
        bull_room_reactions: 0,
        comments: 0,
        total_reading_time_minutes: 0,
        last_activity_at: null
      };
    }
  }

  /**
   * Get user restrictions
   */
  private static async getUserRestrictions(userId: string): Promise<UserRestrictions[]> {
    try {
      const client = createServiceRoleClient();
      
      const { data, error } = await client
        .from('user_restrictions')
        .select(`
          id,
          restriction_type,
          reason,
          expires_at,
          created_at,
          restricted_by_profile:user_profiles!user_restrictions_restricted_by_fkey(email)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(restriction => ({
        id: restriction.id,
        restriction_type: restriction.restriction_type,
        reason: restriction.reason,
        expires_at: restriction.expires_at,
        created_at: restriction.created_at,
        restricted_by_email: (restriction.restricted_by_profile as any)?.email || 'Unknown'
      }));
    } catch (error) {
      console.error('Error fetching user restrictions:', error);
      return [];
    }
  }

  /**
   * Get recent article views
   */
  private static async getRecentArticleViews(userId: string) {
    try {
      const client = createServiceRoleClient();
      
      const { data, error } = await client
        .from('article_views')
        .select(`
          viewed_at,
          reading_time_seconds,
          articles!inner(title)
        `)
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(view => ({
        article_title: (view.articles as any)?.title,
        viewed_at: view.viewed_at,
        reading_time_seconds: view.reading_time_seconds
      }));
    } catch (error) {
      console.error('Error fetching recent article views:', error);
      return [];
    }
  }

  /**
   * Get recent brief views
   */
  private static async getRecentBriefViews(userId: string) {
    try {
      const client = createServiceRoleClient();
      
      const { data, error } = await client
        .from('brief_views')
        .select(`
          viewed_at,
          briefs!inner(title)
        `)
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(view => ({
        brief_title: (view.briefs as any)?.title,
        viewed_at: view.viewed_at
      }));
    } catch (error) {
      console.error('Error fetching recent brief views:', error);
      return [];
    }
  }

  /**
   * Get recent bookmarks
   */
  private static async getRecentBookmarks(userId: string) {
    try {
      const client = createServiceRoleClient();
      
      const { data, error } = await client
        .from('bookmarks')
        .select(`
          created_at,
          articles!inner(title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(bookmark => ({
        article_title: (bookmark.articles as any)?.title,
        created_at: bookmark.created_at
      }));
    } catch (error) {
      console.error('Error fetching recent bookmarks:', error);
      return [];
    }
  }

  /**
   * Get recent bull room activity
   */
  private static async getRecentBullRoomActivity(userId: string) {
    try {
      const client = createServiceRoleClient();
      
      // Get recent messages
      const { data: messages, error: messagesError } = await client
        .from('bull_room_messages')
        .select(`
          content,
          created_at,
          bull_rooms!inner(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (messagesError) throw messagesError;

      // Get recent reactions
      const { data: reactions, error: reactionsError } = await client
        .from('bull_room_reactions')
        .select(`
          created_at,
          bull_rooms!inner(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reactionsError) throw reactionsError;

      // Combine and sort activities
      const activities = [
        ...(messages || []).map(msg => ({
          room_name: (msg.bull_rooms as any)?.name,
          message_content: msg.content,
          created_at: msg.created_at,
          type: 'message' as const
        })),
        ...(reactions || []).map(reaction => ({
          room_name: (reaction.bull_rooms as any)?.name,
          message_content: 'Reacted to message',
          created_at: reaction.created_at,
          type: 'reaction' as const
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 10);

      return activities;
    } catch (error) {
      console.error('Error fetching recent bull room activity:', error);
      return [];
    }
  }

  /**
   * Get all users with basic info and activity counts for admin list view
   */
  static async getAllUsersWithStats(): Promise<Array<{
    id: string;
    email: string;
    username: string;
    is_admin: boolean | null;
    newsletter_subscribed: boolean | null;
    subscription_tier: string | null;
    created_at: string;
    updated_at: string | null;
    total_views: number;
    total_bookmarks: number;
    total_messages: number;
    last_activity_at: string | null;
  }>> {
    try {
      const client = createServiceRoleClient();
      
      // Get all users with basic profile info
      const { data: users, error: usersError } = await client
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Get activity stats for all users in batch
      const userIds = users?.map(user => user.id) || [];
      
      const [articleViews, briefViews, bookmarks, messages] = await Promise.all([
        client
          .from('article_views')
          .select('user_id')
          .in('user_id', userIds),
        
        client
          .from('brief_views')
          .select('user_id')
          .in('user_id', userIds),
        
        client
          .from('bookmarks')
          .select('user_id')
          .in('user_id', userIds),
        
        client
          .from('bull_room_messages')
          .select('user_id')
          .in('user_id', userIds)
      ]);

      // Get last activity for each user
      const { data: lastActivities } = await client
        .from('article_views')
        .select('user_id, viewed_at')
        .in('user_id', userIds)
        .order('viewed_at', { ascending: false });

      // Create activity maps
      const articleViewCounts = new Map<string, number>();
      const briefViewCounts = new Map<string, number>();
      const bookmarkCounts = new Map<string, number>();
      const messageCounts = new Map<string, number>();
      const lastActivityMap = new Map<string, string>();

      // Count activities per user
      articleViews.data?.forEach(view => {
        if (view.user_id) {
          articleViewCounts.set(view.user_id, (articleViewCounts.get(view.user_id) || 0) + 1);
        }
      });

      briefViews.data?.forEach(view => {
        if (view.user_id) {
          briefViewCounts.set(view.user_id, (briefViewCounts.get(view.user_id) || 0) + 1);
        }
      });

      bookmarks.data?.forEach(bookmark => {
        if (bookmark.user_id) {
          bookmarkCounts.set(bookmark.user_id, (bookmarkCounts.get(bookmark.user_id) || 0) + 1);
        }
      });

      messages.data?.forEach(message => {
        if (message.user_id) {
          messageCounts.set(message.user_id, (messageCounts.get(message.user_id) || 0) + 1);
        }
      });

      // Get last activity per user
      lastActivities?.forEach(activity => {
        if (activity.user_id && !lastActivityMap.has(activity.user_id)) {
          lastActivityMap.set(activity.user_id, activity.viewed_at);
        }
      });

      // Combine user data with stats
      return (users || []).map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        is_admin: user.is_admin,
        newsletter_subscribed: user.newsletter_subscribed,
        subscription_tier: user.subscription_tier,
        created_at: user.created_at,
        updated_at: user.updated_at,
        total_views: (articleViewCounts.get(user.id) || 0) + (briefViewCounts.get(user.id) || 0),
        total_bookmarks: bookmarkCounts.get(user.id) || 0,
        total_messages: messageCounts.get(user.id) || 0,
        last_activity_at: lastActivityMap.get(user.id) || null
      }));
    } catch (error) {
      throw new Error(`Failed to fetch users with stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
