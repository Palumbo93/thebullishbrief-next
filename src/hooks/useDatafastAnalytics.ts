import { useDatafast } from '../contexts/DatafastContext';

/**
 * Helper function to track a goal
 */
const trackGoal = async (goal: string, properties: Record<string, any> = {}) => {
  try {
    const response = await fetch(`${window.location.origin}/api/analytics/goal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal,
        properties
      })
    });
    
    // Silently fail if tracking doesn't work
    if (!response.ok) {
      // Could add debug logging here if needed for development
    }
  } catch (error) {
    // Silently fail if tracking doesn't work
  }
};

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
      await trackGoal('article_bookmark', { 
        article_id: articleId, 
        title 
      });
    },
    trackShare: async (articleId: string, title: string, platform: string) => {
      await trackGoal('article_share', { 
        article_id: articleId, 
        title, 
        platform 
      });
    }
  };
};

/**
 * Hook for tracking brief engagement with Datafa.st
 */
export const useTrackBriefEngagement = () => {
  return {
    trackShare: async (briefId: string, title: string, platform: string) => {
      await trackGoal('brief_share', { 
        brief_id: briefId, 
        title, 
        platform 
      });
    },
    trackActionLinkClick: async (briefId: string, actionType: string) => {
      await trackGoal('brief_action_link_clicked', { 
        brief_id: briefId, 
        action_type: actionType 
      });
    }
  };
};

/**
 * Hook for tracking user actions with Datafa.st
 */
export const useTrackUserActions = () => {
  return {
    trackSignup: async (method?: string, userData?: { email?: string; username?: string }) => {
      await trackGoal('user_signup', { 
        signup_method: method || 'email',
        user_email: userData?.email || '',
        username: userData?.username || ''
      });
    },
    trackLogin: async (method?: string, userData?: { email?: string }) => {
      await trackGoal('user_login', { 
        login_method: method || 'email',
        user_email: userData?.email || ''
      });
    },
    trackComment: async (contentType: string, contentId: string) => {
      await trackGoal('comment_post', { 
        content_type: contentType, 
        content_id: contentId 
      });
    }
  };
};

/**
 * Hook for tracking search with Datafa.st
 */
export const useTrackSearch = () => {
  return {
    trackSearch: async (query: string, resultsCount?: number) => {
      await trackGoal('search_performed', { 
        search_query: query,
        results_count: resultsCount?.toString() || '0'
      });
    }
  };
};

/**
 * Hook for tracking prompt interactions with Datafa.st
 */
export const useTrackPromptInteractions = () => {
  return {
    trackPromptCopied: async (promptId: string, promptTitle: string) => {
      await trackGoal('prompt_copied', { 
        prompt_id: promptId, 
        prompt_title: promptTitle 
      });
    },
    trackPromptDownloaded: async (promptId: string, promptTitle: string) => {
      await trackGoal('prompt_downloaded', { 
        prompt_id: promptId, 
        prompt_title: promptTitle 
      });
    }
  };
};

/**
 * Hook for tracking CTA button interactions with Datafa.st
 */
export const useTrackCTAInteractions = () => {
  return {
    trackCTAButtonClick: async (buttonLocation: string, buttonText?: string, additionalProperties?: Record<string, any>) => {
      await trackGoal('cta_button_clicked', { 
        button_location: buttonLocation,
        button_text: buttonText || 'Join Free Now',
        ...additionalProperties
      });
    }
  };
};

/**
 * Hook for tracking brief engagement and scroll behavior with Datafa.st
 */
export const useTrackBriefScrolling = () => {
  return {
    trackBriefScrolledHalfway: async (briefId: string, briefTitle: string) => {
      await trackGoal('brief_scrolled_half_way', { 
        brief_id: briefId,
        brief_title: briefTitle
      });
    },
    trackPopupView: async (briefId: string, briefTitle: string, popupType: string = 'mobile_signup') => {
      await trackGoal('popup_viewed', { 
        brief_id: briefId,
        brief_title: briefTitle,
        popup_type: popupType,
        page_type: 'brief'
      });
    }
  };
};
