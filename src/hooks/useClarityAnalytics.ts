import { useClarity } from '../contexts/ClarityContext';

/**
 * Helper function to track an event with Clarity
 */
const trackClarityEvent = (eventName: string, properties: Record<string, any> = {}) => {
  try {
    if (typeof window !== 'undefined' && window.clarity) {
      window.clarity('event', eventName);
      
      // Add properties if provided
      if (Object.keys(properties).length > 0) {
        window.clarity('identify', properties);
      }
    }
  } catch (error) {
    // Silently fail if tracking doesn't work
  }
};

/**
 * Hook for tracking page views with Microsoft Clarity
 */
export const useTrackPageView = () => {
  const { trackPageView } = useClarity();
  
  return {
    trackPageView: (path: string, title?: string) => {
      trackPageView(path, title);
    }
  };
};

/**
 * Hook for tracking article engagement with Microsoft Clarity
 */
export const useTrackArticleEngagement = () => {
  return {
    trackBookmark: async (articleId: string, title: string) => {
      trackClarityEvent('Article Bookmark', { 
        articleId: articleId, 
        title 
      });
    },
    trackShare: async (articleId: string, title: string, platform: string) => {
      trackClarityEvent('Article Share', { 
        articleId: articleId, 
        title, 
        platform 
      });
    }
  };
};

/**
 * Hook for tracking brief engagement with Microsoft Clarity
 */
export const useTrackBriefEngagement = () => {
  return {
    trackShare: async (briefId: string, title: string, platform: string) => {
      trackClarityEvent('Brief Share', { 
        briefId: briefId, 
        title, 
        platform 
      });
    },
    trackActionLinkClick: async (briefId: string, actionType: string) => {
      trackClarityEvent('Brief Action Link Click', { 
        briefId: briefId, 
        actionType: actionType 
      });
    },
    trackLeadGenSignup: async (briefId: string, title: string, source: string, userType: string) => {
      trackClarityEvent('Lead Generation Signup', { 
        briefId: briefId, 
        title, 
        source: source, // 'popup' or 'sidebar_widget'
        userType: userType // 'authenticated' or 'guest'
      });
    },
    trackBrokerageClick: async (briefId: string, title: string, brokerageName: string, brokerageId: string, location: string = 'action_panel') => {
      trackClarityEvent('Brokerage Link Clicked', { 
        briefId: briefId, 
        title, 
        brokerageName: brokerageName,
        brokerageId: brokerageId,
        location: location // 'action_panel' or 'inline'
      });
    }
  };
};

/**
 * Hook for tracking user actions with Microsoft Clarity
 */
export const useTrackUserActions = () => {
  return {
    trackSignup: async (method?: string, userData?: { email?: string; username?: string }) => {
      trackClarityEvent('User Signup', { 
        signupMethod: method || 'email',
        userEmail: userData?.email || '',
        username: userData?.username || ''
      });
    },
    trackLogin: async (method?: string, userData?: { email?: string }) => {
      trackClarityEvent('User Login', { 
        loginMethod: method || 'email',
        userEmail: userData?.email || ''
      });
    },
    trackComment: async (contentType: string, contentId: string) => {
      trackClarityEvent('Comment Post', { 
        contentType: contentType, 
        contentId: contentId 
      });
    }
  };
};

/**
 * Hook for tracking search with Microsoft Clarity
 */
export const useTrackSearch = () => {
  return {
    trackSearch: async (query: string, resultsCount?: number) => {
      trackClarityEvent('Search Performed', { 
        searchQuery: query,
        resultsCount: resultsCount?.toString() || '0'
      });
    }
  };
};

/**
 * Hook for tracking prompt interactions with Microsoft Clarity
 */
export const useTrackPromptInteractions = () => {
  return {
    trackPromptCopied: async (promptId: string, promptTitle: string) => {
      trackClarityEvent('Prompt Copied', { 
        promptId: promptId, 
        promptTitle: promptTitle 
      });
    },
    trackPromptDownloaded: async (promptId: string, promptTitle: string) => {
      trackClarityEvent('Prompt Downloaded', { 
        promptId: promptId, 
        promptTitle: promptTitle 
      });
    }
  };
};

/**
 * Hook for tracking CTA button interactions with Microsoft Clarity
 */
export const useTrackCTAInteractions = () => {
  return {
    trackCTAButtonClick: async (buttonLocation: string, buttonText?: string, additionalProperties?: Record<string, any>) => {
      trackClarityEvent('CTA Button Click', { 
        buttonLocation: buttonLocation,
        buttonText: buttonText || 'Join Free Now',
        ...additionalProperties
      });
    }
  };
};

/**
 * Hook for tracking brief engagement and scroll behavior with Microsoft Clarity
 */
export const useTrackBriefScrolling = () => {
  return {
    trackBriefScrolledHalfway: async (briefId: string, briefTitle: string) => {
      trackClarityEvent('Brief Scrolled Halfway', { 
        briefId: briefId,
        briefTitle: briefTitle
      });
    },
    trackPopupView: async (briefId: string, briefTitle: string, popupType: string = 'mobile_signup') => {
      trackClarityEvent('Popup Viewed', { 
        briefId: briefId,
        briefTitle: briefTitle,
        popupType: popupType,
        pageType: 'brief'
      });
    },
    trackPageScrollStarted: async (briefId: string, briefTitle: string) => {
      trackClarityEvent('Page Scroll Started', { 
        briefId: briefId,
        briefTitle: briefTitle,
        pageType: 'brief'
      });
    }
  };
};

/**
 * Hook for tracking video interactions with Microsoft Clarity
 */
export const useTrackVideoInteractions = () => {
  return {
    trackVideoClick: async (briefId: string, briefTitle: string, videoUrl: string, clickSource: string = 'thumbnail') => {
      trackClarityEvent('Video Click', { 
        briefId: briefId,
        briefTitle: briefTitle,
        videoUrl: videoUrl,
        clickSource: clickSource,
        pageType: 'brief'
      });
    },
    trackVideoModalOpened: async (briefId: string, briefTitle: string, videoUrl: string) => {
      trackClarityEvent('Video Modal Opened', { 
        briefId: briefId,
        briefTitle: briefTitle,
        videoUrl: videoUrl,
        pageType: 'brief'
      });
    },
    trackVideoModalClosed: async (briefId: string, briefTitle: string, videoUrl: string) => {
      trackClarityEvent('Video Modal Closed', { 
        briefId: briefId,
        briefTitle: briefTitle,
        videoUrl: videoUrl,
        pageType: 'brief'
      });
    }
  };
};
