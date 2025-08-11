import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, hasSupabaseCredentials } from '../lib/supabase';
import { queryKeys } from '../lib/queryClient';
import { useAuth } from '../contexts/AuthContext';
import { useRef, useCallback } from 'react';

// Track view tracking attempts to prevent spam
const briefViewTrackingAttempts = new Map<string, number>();

/**
 * Hook for tracking brief views with debouncing and deduplication
 */
export const useTrackBriefView = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const trackingRef = useRef<Map<string, boolean>>(new Map());

  const trackView = useCallback(async (briefId: string) => {
    if (!hasSupabaseCredentials || !briefId || briefId.trim() === '') return false;

    // Prevent multiple simultaneous tracking attempts for the same brief
    if (trackingRef.current.get(briefId)) {
      return false;
    }

    // Check if we've already tracked this view recently (client-side deduplication)
    const now = Date.now();
    const lastAttempt = briefViewTrackingAttempts.get(briefId) || 0;
    const timeSinceLastAttempt = now - lastAttempt;
    
    // Prevent tracking more than once per 5 seconds per brief
    if (timeSinceLastAttempt < 5000) {
      return false;
    }

    // Mark as tracking to prevent concurrent calls
    trackingRef.current.set(briefId, true);
    briefViewTrackingAttempts.set(briefId, now);

    try {
      // Get client IP and user agent
      const userAgent = navigator.userAgent;
      const referrer = document.referrer || null;

      // For now, we'll use a placeholder IP since we can't get real IP client-side
      // In production, you'd get this from your server or use a service like ipify
      const ipAddress = '127.0.0.1'; // Placeholder - in real app, get from server

      // Get the actual brief UUID if we're passed a slug
      let briefUuid = briefId;
      if (!briefId.includes('-')) {
        const { data: briefData, error: briefError } = await supabase
          .from('briefs')
          .select('id')
          .eq('slug', briefId)
          .single();
        
        if (!briefError && briefData) {
          briefUuid = briefData.id;
        }
      }

      // Server-side deduplication check - look for recent views from same IP
      const { data: existingViews, error: checkError } = await supabase
        .from('brief_views')
        .select('id')
        .eq('brief_id', briefUuid)
        .eq('ip_address', ipAddress)
        .gte('viewed_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
        .limit(1);

      if (checkError) {
        console.error('Error checking brief view deduplication:', checkError);
        return false;
      }

      // If we already have a view from this IP in the last hour, skip
      if (existingViews && existingViews.length > 0) {
        return false;
      }

      // Insert the view
      const { error: insertError } = await supabase
        .from('brief_views')
        .insert({
          brief_id: briefUuid,
          user_id: user?.id || null,
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer: referrer,
          viewed_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error tracking brief view:', insertError);
        return false;
      }

      return true;
    } finally {
      // Clear tracking flag
      trackingRef.current.set(briefId, false);
    }
  }, [user]);

  return useMutation({
    mutationFn: trackView,
    onSuccess: (success, briefId) => {
      if (success) {
        // Optimistically update the view count in cache
        queryClient.setQueryData(queryKeys.briefs.all(), (oldData: any) => {
          if (!oldData) return oldData;
          
          const updateBriefViewCount = (briefs: any[]) => {
            return briefs.map(brief => {
              if (String(brief.id) === String(briefId) || brief.slug === briefId) {
                return {
                  ...brief,
                  view_count: (brief.view_count || 0) + 1
                };
              }
              return brief;
            });
          };

          return updateBriefViewCount(oldData || []);
        });

        // Also update individual brief queries
        queryClient.setQueryData(queryKeys.briefs.detail(briefId), (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            view_count: (oldData.view_count || 0) + 1
          };
        });

        // Update view count cache
        queryClient.setQueryData(['brief-view-count', briefId], (oldCount: number) => {
          return (oldCount || 0) + 1;
        });
      }
    },
  });
};

/**
 * Hook for getting brief view count
 * Now properly handles both UUID and slug-based queries
 */
export const useBriefViewCount = (briefId: string) => {
  return useQuery({
    queryKey: ['brief-view-count', briefId],
    queryFn: async () => {
      if (!hasSupabaseCredentials || !briefId || briefId.trim() === '') {
        return 0;
      }

      // First, try to get the brief by ID (UUID)
      let { data, error } = await supabase
        .from('briefs')
        .select('view_count')
        .eq('id', briefId)
        .single();

      // If that fails, try to get by slug
      if (error && error.code === 'PGRST116') {
        const { data: briefData, error: slugError } = await supabase
          .from('briefs')
          .select('view_count')
          .eq('slug', briefId)
          .single();
        
        if (slugError) {
          console.error('Error fetching brief view count:', slugError);
          return 0;
        }
        
        data = briefData;
      } else if (error) {
        console.error('Error fetching brief view count:', error);
        return 0;
      }

      return data?.view_count || 0;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!briefId && briefId.trim() !== '',
  });
};

/**
 * Hook for getting brief analytics (optional)
 */
export const useBriefAnalytics = (briefId: string) => {
  return useQuery({
    queryKey: ['brief-analytics', briefId],
    queryFn: async () => {
      if (!hasSupabaseCredentials || !briefId || briefId.trim() === '') {
        return null;
      }

      // Get the actual brief UUID if we're passed a slug
      let briefUuid = briefId;
      if (!briefId.includes('-')) {
        const { data: briefData, error: briefError } = await supabase
          .from('briefs')
          .select('id')
          .eq('slug', briefId)
          .single();
        
        if (!briefError && briefData) {
          briefUuid = briefData.id;
        }
      }

      const { data, error } = await supabase
        .from('brief_views')
        .select('viewed_at, user_id')
        .eq('brief_id', briefUuid)
        .gte('viewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('viewed_at', { ascending: false });

      if (error) {
        console.error('Error fetching brief analytics:', error);
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
    enabled: !!briefId && briefId.trim() !== '',
  });
}; 