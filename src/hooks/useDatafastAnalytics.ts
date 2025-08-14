import { useDatafast } from '../contexts/DatafastContext';

/**
 * Hook for tracking page views with Datafa.st
 */
export const useTrackPageView = () => {
  const { trackPageView } = useDatafast();
  
  return {
    trackPageView: (path: string, title?: string) => {
      trackPageView(path, title);
    }
  };
};

/**
 * Hook for tracking article engagement with Datafa.st
 */
export const useTrackArticleEngagement = () => {
  return {
    trackBookmark: async (articleId: string, title: string) => {
      try {
        await fetch('/api/analytics/goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: 'article_bookmark',
            properties: { article_id: articleId, title }
          })
        });
      } catch (error) {
        console.error('Failed to track article bookmark:', error);
      }
    },
    trackShare: async (articleId: string, title: string, platform: string) => {
      try {
        await fetch('/api/analytics/goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: 'article_share',
            properties: { article_id: articleId, title, platform }
          })
        });
      } catch (error) {
        console.error('Failed to track article share:', error);
      }
    }
  };
};

/**
 * Hook for tracking brief engagement with Datafa.st
 */
export const useTrackBriefEngagement = () => {
  return {
    trackShare: async (briefId: string, title: string, platform: string) => {
      try {
        await fetch('/api/analytics/goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: 'brief_share',
            properties: { brief_id: briefId, title, platform }
          })
        });
      } catch (error) {
        console.error('Failed to track brief share:', error);
      }
    },
    trackActionLinkClick: async (briefId: string, actionType: string) => {
      try {
        await fetch('/api/analytics/goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: 'brief_action_link_clicked',
            properties: { brief_id: briefId, action_type: actionType }
          })
        });
      } catch (error) {
        console.error('Failed to track brief action link click:', error);
      }
    }
  };
};

/**
 * Hook for tracking user actions with Datafa.st
 */
export const useTrackUserActions = () => {
  return {
    trackSignup: async (method?: string) => {
      try {
        await fetch('/api/analytics/goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: 'user_signup',
            properties: { signup_method: method || 'email' }
          })
        });
      } catch (error) {
        console.error('Failed to track user signup:', error);
      }
    },
    trackLogin: async (method?: string) => {
      try {
        await fetch('/api/analytics/goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: 'user_login',
            properties: { login_method: method || 'email' }
          })
        });
      } catch (error) {
        console.error('Failed to track user login:', error);
      }
    },
    trackComment: async (contentType: string, contentId: string) => {
      try {
        await fetch('/api/analytics/goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: 'comment_post',
            properties: { content_type: contentType, content_id: contentId }
          })
        });
      } catch (error) {
        console.error('Failed to track comment post:', error);
      }
    }
  };
};

/**
 * Hook for tracking search with Datafa.st
 */
export const useTrackSearch = () => {
  return {
    trackSearch: async (query: string, resultsCount?: number) => {
      try {
        await fetch('/api/analytics/goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: 'search_performed',
            properties: { 
              search_query: query,
              results_count: resultsCount?.toString() || '0'
            }
          })
        });
      } catch (error) {
        console.error('Failed to track search:', error);
      }
    }
  };
};

/**
 * Hook for tracking prompt interactions with Datafa.st
 */
export const useTrackPromptInteractions = () => {
  return {
    trackPromptCopied: async (promptId: string, promptTitle: string) => {
      try {
        await fetch('/api/analytics/goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: 'prompt_copied',
            properties: { prompt_id: promptId, prompt_title: promptTitle }
          })
        });
      } catch (error) {
        console.error('Failed to track prompt copied:', error);
      }
    },
    trackPromptDownloaded: async (promptId: string, promptTitle: string) => {
      try {
        await fetch('/api/analytics/goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goal: 'prompt_downloaded',
            properties: { prompt_id: promptId, prompt_title: promptTitle }
          })
        });
      } catch (error) {
        console.error('Failed to track prompt downloaded:', error);
      }
    }
  };
};
