"use client";

import React, { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { analyticsService } from '../services/analytics';

interface AnalyticsContextType {
  trackPageView: (path: string, title?: string) => void;
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void;
  trackConversion: (conversionType: string, value?: number) => void;
  setUserProperties: (properties: Record<string, any>) => void;
  trackArticleView: (articleId: string, title: string, author?: string) => void;
  trackArticleBookmark: (articleId: string, title: string) => void;
  trackArticleShare: (articleId: string, title: string, platform: string) => void;
  trackBriefView: (briefId: string, title: string) => void;
  trackBriefBookmark: (briefId: string, title: string) => void;
  trackBriefShare: (briefId: string, title: string, platform: string) => void;
  trackUserSignup: (method?: string) => void;
  trackUserLogin: (method?: string) => void;
  trackCommentPost: (contentType: string, contentId: string) => void;
  trackError: (error: Error, context?: string) => void;
  trackSearch: (query: string, resultsCount?: number) => void;
  trackNavigation: (from: string, to: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
  gtmId: string;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ 
  children, 
  gtmId 
}) => {
  useEffect(() => {
    // Initialize analytics service
    analyticsService.initialize(gtmId);
  }, [gtmId]);

  const trackPageView = useCallback((path: string, title?: string) => {
    analyticsService.trackPageView(path, title);
  }, []);

  const trackEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    analyticsService.trackEvent(eventName, parameters);
  }, []);

  const trackConversion = useCallback((conversionType: string, value?: number) => {
    analyticsService.trackConversion(conversionType, value);
  }, []);

  const setUserProperties = useCallback((properties: Record<string, any>) => {
    analyticsService.setUserProperties(properties);
  }, []);

  const trackArticleView = useCallback((articleId: string, title: string, author?: string) => {
    analyticsService.trackArticleView(articleId, title, author);
  }, []);

  const trackArticleBookmark = useCallback((articleId: string, title: string) => {
    analyticsService.trackArticleBookmark(articleId, title);
  }, []);

  const trackArticleShare = useCallback((articleId: string, title: string, platform: string) => {
    analyticsService.trackArticleShare(articleId, title, platform);
  }, []);

  const trackBriefView = useCallback((briefId: string, title: string) => {
    analyticsService.trackBriefView(briefId, title);
  }, []);

  const trackBriefBookmark = useCallback((briefId: string, title: string) => {
    analyticsService.trackBriefBookmark(briefId, title);
  }, []);

  const trackBriefShare = useCallback((briefId: string, title: string, platform: string) => {
    analyticsService.trackBriefShare(briefId, title, platform);
  }, []);

  const trackUserSignup = useCallback((method: string = 'email') => {
    analyticsService.trackUserSignup(method);
  }, []);

  const trackUserLogin = useCallback((method: string = 'email') => {
    analyticsService.trackUserLogin(method);
  }, []);

  const trackCommentPost = useCallback((contentType: string, contentId: string) => {
    analyticsService.trackCommentPost(contentType, contentId);
  }, []);

  const trackError = useCallback((error: Error, context?: string) => {
    analyticsService.trackError(error, context);
  }, []);

  const trackSearch = useCallback((query: string, resultsCount?: number) => {
    analyticsService.trackSearch(query, resultsCount);
  }, []);

  const trackNavigation = useCallback((from: string, to: string) => {
    analyticsService.trackNavigation(from, to);
  }, []);

  const value: AnalyticsContextType = {
    trackPageView,
    trackEvent,
    trackConversion,
    setUserProperties,
    trackArticleView,
    trackArticleBookmark,
    trackArticleShare,
    trackBriefView,
    trackBriefBookmark,
    trackBriefShare,
    trackUserSignup,
    trackUserLogin,
    trackCommentPost,
    trackError,
    trackSearch,
    trackNavigation,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
