"use client";

import React, { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { datafastService } from '../services/datafast';

interface DatafastContextType {
  trackPageView: (path: string, title?: string) => void;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackArticleView: (articleId: string, title: string, author?: string) => void;
  trackArticleBookmark: (articleId: string, title: string) => void;
  trackArticleShare: (articleId: string, title: string, platform: string) => void;
  trackBriefView: (briefId: string, title: string) => void;
  trackBriefBookmark: (briefId: string, title: string) => void;
  trackBriefShare: (briefId: string, title: string, platform: string) => void;
  trackUserSignup: (method?: string) => void;
  trackUserLogin: (method?: string) => void;
  trackCommentPost: (contentType: string, contentId: string) => void;
  trackSearch: (query: string, resultsCount?: number) => void;
  debug: () => void;
}

const DatafastContext = createContext<DatafastContextType | undefined>(undefined);

interface DatafastProviderProps {
  children: ReactNode;
  siteId: string;
}

export const DatafastProvider: React.FC<DatafastProviderProps> = ({ 
  children, 
  siteId 
}) => {
  useEffect(() => {
    // Initialize Datafa.st service
    datafastService.initialize(siteId);
  }, [siteId]);

  const trackPageView = useCallback((path: string, title?: string) => {
    datafastService.trackPageView(path, title);
  }, []);

  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    datafastService.trackEvent({ event: eventName, properties });
  }, []);

  const trackArticleView = useCallback((articleId: string, title: string, author?: string) => {
    datafastService.trackArticleView(articleId, title, author);
  }, []);

  const trackArticleBookmark = useCallback((articleId: string, title: string) => {
    datafastService.trackArticleBookmark(articleId, title);
  }, []);

  const trackArticleShare = useCallback((articleId: string, title: string, platform: string) => {
    datafastService.trackArticleShare(articleId, title, platform);
  }, []);

  const trackBriefView = useCallback((briefId: string, title: string) => {
    datafastService.trackBriefView(briefId, title);
  }, []);

  const trackBriefBookmark = useCallback((briefId: string, title: string) => {
    datafastService.trackBriefBookmark(briefId, title);
  }, []);

  const trackBriefShare = useCallback((briefId: string, title: string, platform: string) => {
    datafastService.trackBriefShare(briefId, title, platform);
  }, []);

  const trackUserSignup = useCallback((method: string = 'email') => {
    datafastService.trackUserSignup(method);
  }, []);

  const trackUserLogin = useCallback((method: string = 'email') => {
    datafastService.trackUserLogin(method);
  }, []);

  const trackCommentPost = useCallback((contentType: string, contentId: string) => {
    datafastService.trackCommentPost(contentType, contentId);
  }, []);

  const trackSearch = useCallback((query: string, resultsCount?: number) => {
    datafastService.trackSearch(query, resultsCount);
  }, []);

  const debug = useCallback(() => {
    datafastService.debug();
  }, []);

  const value: DatafastContextType = {
    trackPageView,
    trackEvent,
    trackArticleView,
    trackArticleBookmark,
    trackArticleShare,
    trackBriefView,
    trackBriefBookmark,
    trackBriefShare,
    trackUserSignup,
    trackUserLogin,
    trackCommentPost,
    trackSearch,
    debug,
  };

  return (
    <DatafastContext.Provider value={value}>
      {children}
    </DatafastContext.Provider>
  );
};

export const useDatafast = (): DatafastContextType => {
  const context = useContext(DatafastContext);
  if (context === undefined) {
    throw new Error('useDatafast must be used within a DatafastProvider');
  }
  return context;
};
