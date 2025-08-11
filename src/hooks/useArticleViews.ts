import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, hasSupabaseCredentials } from '../lib/supabase';
import { queryKeys } from '../lib/queryClient';
import { useAuth } from '../contexts/AuthContext';
import { useRef, useCallback } from 'react';

// Track view tracking attempts to prevent spam
const viewTrackingAttempts = new Map<string, number>();

/**
 * Hook for tracking article views with debouncing and deduplication
 */
export const useTrackArticleView = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const trackingRef = useRef<Map<string, boolean>>(new Map());

  const trackView = useCallback(async (articleId: string) => {
    if (!hasSupabaseCredentials || !articleId || articleId.trim() === '') return false;

    // Prevent multiple simultaneous tracking attempts for the same article
    if (trackingRef.current.get(articleId)) {
      return false;
    }

    // Check if we've already tracked this view recently (client-side deduplication)
    const now = Date.now();
    const lastAttempt = viewTrackingAttempts.get(articleId) || 0;
    const timeSinceLastAttempt = now - lastAttempt;
    
    // Prevent tracking more than once per 5 seconds per article
    if (timeSinceLastAttempt < 5000) {
      return false;
    }

    // Mark as tracking to prevent concurrent calls
    trackingRef.current.set(articleId, true);
    viewTrackingAttempts.set(articleId, now);

    try {
      // Get client IP and user agent
      const userAgent = navigator.userAgent;
      const referrer = document.referrer || null;

      // For now, we'll use a placeholder IP since we can't get real IP client-side
      // In production, you'd get this from your server or use a service like ipify
      const ipAddress = '127.0.0.1'; // Placeholder - in real app, get from server

      // Get the actual article UUID if we're passed a slug
      let articleUuid = articleId;
      if (!articleId.includes('-')) {
        const { data: articleData, error: articleError } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', articleId)
          .single();
        
        if (!articleError && articleData) {
          articleUuid = articleData.id;
        }
      }

      // Server-side deduplication check - look for recent views from same IP
      const { data: existingViews, error: checkError } = await supabase
        .from('article_views')
        .select('id')
        .eq('article_id', articleUuid)
        .eq('ip_address', ipAddress)
        .gte('viewed_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .limit(1);

      if (checkError) {
        console.error('Error checking view deduplication:', checkError);
        return false;
      }

      // If we already have a view from this IP in the last hour, skip
      if (existingViews && existingViews.length > 0) {
        return false;
      }

      // Insert the view
      const { error: insertError } = await supabase
        .from('article_views')
        .insert({
          article_id: articleUuid,
          user_id: user?.id || null,
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer: referrer,
          viewed_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error tracking article view:', insertError);
        return false;
      }

      return true;
    } finally {
      // Clear tracking flag
      trackingRef.current.set(articleId, false);
    }
  }, [user]);

  return useMutation({
    mutationFn: trackView,
    onSuccess: (success, articleId) => {
      if (success) {
        // Optimistically update the view count in cache
        queryClient.setQueryData(queryKeys.articles.all, (oldData: any) => {
          if (!oldData) return oldData;
          
          const updateArticleViewCount = (articles: any[]) => {
            return articles.map(article => {
              if (String(article.id) === String(articleId) || article.slug === articleId) {
                return {
                  ...article,
                  view_count: (article.view_count || 0) + 1
                };
              }
              return article;
            });
          };

          return {
            ...oldData,
            articles: updateArticleViewCount(oldData.articles || []),
            featuredArticles: updateArticleViewCount(oldData.featuredArticles || [])
          };
        });

        // Also update individual article queries
        queryClient.setQueryData(queryKeys.articles.detail(articleId), (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            view_count: (oldData.view_count || 0) + 1
          };
        });

        // Update view count cache
        queryClient.setQueryData(['article-view-count', articleId], (oldCount: number) => {
          return (oldCount || 0) + 1;
        });
      }
    },
  });
};

/**
 * Hook for getting article view count
 * Now properly handles both UUID and slug-based queries
 */
export const useArticleViewCount = (articleId: string) => {
  return useQuery({
    queryKey: ['article-view-count', articleId],
    queryFn: async () => {
      if (!hasSupabaseCredentials || !articleId || articleId.trim() === '') {
        return 0;
      }

      // First, try to get the article by ID (UUID)
      let { data, error } = await supabase
        .from('articles')
        .select('view_count')
        .eq('id', articleId)
        .single();

      // If that fails, try to get by slug
      if (error && error.code === 'PGRST116') {
        const { data: articleData, error: slugError } = await supabase
          .from('articles')
          .select('view_count')
          .eq('slug', articleId)
          .single();
        
        if (slugError) {
          console.error('Error fetching article view count:', slugError);
          return 0;
        }
        
        data = articleData;
      } else if (error) {
        console.error('Error fetching article view count:', error);
        return 0;
      }

      return data?.view_count || 0;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!articleId && articleId.trim() !== '',
  });
};

/**
 * Hook for getting article analytics (optional)
 */
export const useArticleAnalytics = (articleId: string) => {
  return useQuery({
    queryKey: ['article-analytics', articleId],
    queryFn: async () => {
      if (!hasSupabaseCredentials || !articleId || articleId.trim() === '') {
        return null;
      }

      // Get the actual article UUID if we're passed a slug
      let articleUuid = articleId;
      if (!articleId.includes('-')) {
        const { data: articleData, error: articleError } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', articleId)
          .single();
        
        if (!articleError && articleData) {
          articleUuid = articleData.id;
        }
      }

      const { data, error } = await supabase
        .from('article_views')
        .select('viewed_at, user_id')
        .eq('article_id', articleUuid)
        .gte('viewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('viewed_at', { ascending: false });

      if (error) {
        console.error('Error fetching article analytics:', error);
        return null;
      }

      const views = data || [];
      const totalViews = views.length;
      const uniqueViews = new Set(views.map(v => v.user_id || 'anonymous')).size;

      return {
        totalViews,
        uniqueViews,
        recentViews: views.slice(0, 10) // Last 10 views
      };
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!articleId && articleId.trim() !== '',
  });
}; 