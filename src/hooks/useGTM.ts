/**
 * GTM Analytics Hook
 * Provides interface for tracking events through Google Tag Manager
 */

import { useCallback } from 'react';
import { useConsent } from '../contexts/ConsentContext';

export interface GTMEvent {
  event: string;
  [key: string]: any;
}

export const useGTM = () => {
  const { consent } = useConsent();

  const trackEvent = useCallback((eventData: GTMEvent) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(eventData);
    }
  }, []);

  const trackPageView = useCallback((path: string, title?: string) => {
    trackEvent({
      event: 'page_view',
      page_path: path,
      page_title: title || document.title
    });
  }, [trackEvent]);

  const trackArticleView = useCallback((articleId: string, title: string, author?: string) => {
    trackEvent({
      event: 'article_view',
      article_id: articleId,
      article_title: title,
      article_author: author
    });
  }, [trackEvent]);

  const trackBriefView = useCallback((briefId: string, title: string) => {
    trackEvent({
      event: 'brief_view',
      brief_id: briefId,
      brief_title: title
    });
  }, [trackEvent]);

  const trackUserAction = useCallback((action: string, category: string, label?: string) => {
    trackEvent({
      event: 'user_action',
      action_category: category,
      action_label: label,
      action_name: action
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackArticleView,
    trackBriefView,
    trackUserAction,
    consent
  };
};
