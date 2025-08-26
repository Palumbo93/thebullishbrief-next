"use client";

import React, { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { clarityService } from '../services/clarity';

interface ClarityContextType {
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

const ClarityContext = createContext<ClarityContextType | undefined>(undefined);

interface ClarityProviderProps {
  children: ReactNode;
}

export const ClarityProvider: React.FC<ClarityProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize Microsoft Clarity service
    clarityService.initialize();
  }, []);

  const trackPageView = useCallback((path: string, title?: string) => {
    clarityService.trackPageView(path, title);
  }, []);

  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    clarityService.trackEvent({ event: eventName, properties });
  }, []);

  const trackArticleView = useCallback((articleId: string, title: string, author?: string) => {
    clarityService.trackArticleView(articleId, title, author);
  }, []);

  const trackArticleBookmark = useCallback((articleId: string, title: string) => {
    clarityService.trackArticleBookmark(articleId, title);
  }, []);

  const trackArticleShare = useCallback((articleId: string, title: string, platform: string) => {
    clarityService.trackArticleShare(articleId, title, platform);
  }, []);

  const trackBriefView = useCallback((briefId: string, title: string) => {
    clarityService.trackBriefView(briefId, title);
  }, []);

  const trackBriefBookmark = useCallback((briefId: string, title: string) => {
    clarityService.trackBriefBookmark(briefId, title);
  }, []);

  const trackBriefShare = useCallback((briefId: string, title: string, platform: string) => {
    clarityService.trackBriefShare(briefId, title, platform);
  }, []);

  const trackUserSignup = useCallback((method: string = 'email') => {
    clarityService.trackUserSignup(method);
  }, []);

  const trackUserLogin = useCallback((method: string = 'email') => {
    clarityService.trackUserLogin(method);
  }, []);

  const trackCommentPost = useCallback((contentType: string, contentId: string) => {
    clarityService.trackCommentPost(contentType, contentId);
  }, []);

  const trackSearch = useCallback((query: string, resultsCount?: number) => {
    clarityService.trackSearch(query, resultsCount);
  }, []);

  const debug = useCallback(() => {
    clarityService.debug();
  }, []);

  const value: ClarityContextType = {
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
    <ClarityContext.Provider value={value}>
      {children}
    </ClarityContext.Provider>
  );
};

export const useClarity = (): ClarityContextType => {
  const context = useContext(ClarityContext);
  if (context === undefined) {
    throw new Error('useClarity must be used within a ClarityProvider');
  }
  return context;
};
