import { useDatafast } from '../contexts/DatafastContext';

/**
 * Helper function to track a goal
 */
const trackGoal = async (goal: string, properties: Record<string, any> = {}) => {
  try {
    // Use absolute URL to ensure correct port
    const apiUrl = `${window.location.origin}/api/analytics/goal`;
    console.log('Making request to:', apiUrl);
    console.log('Current origin:', window.location.origin);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal,
        properties
      })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Goal tracking failed:', errorData);
    } else {
      console.log(`${goal} tracked successfully`);
    }
  } catch (error) {
    console.error(`Failed to track ${goal}:`, error);
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
      console.log('Tracking article bookmark:', { articleId, title });
      await trackGoal('article_bookmark', { 
        article_id: articleId, 
        title 
      });
    },
    trackShare: async (articleId: string, title: string, platform: string) => {
      console.log('Tracking article share:', { articleId, title, platform });
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
    trackSignup: async (method?: string) => {
      await trackGoal('user_signup', { 
        signup_method: method || 'email' 
      });
    },
    trackLogin: async (method?: string) => {
      await trackGoal('user_login', { 
        login_method: method || 'email' 
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
