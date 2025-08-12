"use client";

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAnalytics as useAnalyticsContext } from '../contexts/AnalyticsContext';

/**
 * Main analytics hook that provides all tracking functions
 */
export const useAnalytics = () => {
  return useAnalyticsContext();
};

/**
 * Hook for automatic page view tracking
 * Automatically tracks page views when the route changes
 */
export const useTrackPageView = (title?: string) => {
  const { trackPageView } = useAnalytics();
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname || '', title || '');
  }, [pathname, title, trackPageView]);
};

/**
 * Hook for tracking article engagement
 */
export const useTrackArticleEngagement = () => {
  const { trackArticleView, trackArticleBookmark, trackArticleShare } = useAnalytics();

  const trackView = useCallback((articleId: string, title: string, author?: string) => {
    trackArticleView(articleId, title, author);
  }, [trackArticleView]);

  const trackBookmark = useCallback((articleId: string, title: string) => {
    trackArticleBookmark(articleId, title);
  }, [trackArticleBookmark]);

  const trackShare = useCallback((articleId: string, title: string, platform: string) => {
    trackArticleShare(articleId, title, platform);
  }, [trackArticleShare]);

  return {
    trackView,
    trackBookmark,
    trackShare,
  };
};

/**
 * Hook for tracking brief engagement
 */
export const useTrackBriefEngagement = () => {
  const { trackBriefView, trackBriefBookmark, trackBriefShare } = useAnalytics();

  const trackView = useCallback((briefId: string, title: string) => {
    trackBriefView(briefId, title);
  }, [trackBriefView]);

  const trackBookmark = useCallback((briefId: string, title: string) => {
    trackBriefBookmark(briefId, title);
  }, [trackBriefBookmark]);

  const trackShare = useCallback((briefId: string, title: string, platform: string) => {
    trackBriefShare(briefId, title, platform);
  }, [trackBriefShare]);

  return {
    trackView,
    trackBookmark,
    trackShare,
  };
};

/**
 * Hook for tracking user authentication events
 */
export const useTrackAuthEvents = () => {
  const { trackUserSignup, trackUserLogin } = useAnalytics();

  const trackSignup = useCallback((method: string = 'email') => {
    trackUserSignup(method);
  }, [trackUserSignup]);

  const trackLogin = useCallback((method: string = 'email') => {
    trackUserLogin(method);
  }, [trackUserLogin]);

  return {
    trackSignup,
    trackLogin,
  };
};

/**
 * Hook for tracking search events
 */
export const useTrackSearch = () => {
  const { trackSearch } = useAnalytics();

  const trackSearchEvent = useCallback((query: string, resultsCount?: number) => {
    trackSearch(query, resultsCount);
  }, [trackSearch]);

  return {
    trackSearch: trackSearchEvent,
  };
};

/**
 * Hook for tracking navigation events
 */
export const useTrackNavigation = () => {
  const { trackNavigation } = useAnalytics();

  const trackNav = useCallback((from: string, to: string) => {
    trackNavigation(from, to);
  }, [trackNavigation]);

  return {
    trackNavigation: trackNav,
  };
};

/**
 * Hook for tracking error events
 */
export const useTrackErrors = () => {
  const { trackError } = useAnalytics();

  const trackErrorEvent = useCallback((error: Error, context?: string) => {
    trackError(error, context);
  }, [trackError]);

  return {
    trackError: trackErrorEvent,
  };
};

/**
 * Hook for tracking comment events
 */
export const useTrackComments = () => {
  const { trackCommentPost } = useAnalytics();

  const trackPost = useCallback((contentType: string, contentId: string) => {
    trackCommentPost(contentType, contentId);
  }, [trackCommentPost]);

  return {
    trackPost,
  };
};
