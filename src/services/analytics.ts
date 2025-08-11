/**
 * Google Tag Manager Analytics Service
 * Handles all analytics tracking through GTM dataLayer
 */

declare global {
  interface Window {
    dataLayer?: any[];
  }
}

export interface AnalyticsEvent {
  event: string;
  [key: string]: any;
}

export interface PageViewEvent extends AnalyticsEvent {
  event: 'page_view';
  page_path: string;
  page_title?: string;
  page_location?: string;
}

export interface CustomEvent extends AnalyticsEvent {
  event: string;
  event_category?: string;
  event_action?: string;
  event_label?: string;
  [key: string]: any;
}

export class AnalyticsService {
  private isInitialized: boolean = false;
  private gtmId: string | null = null;

  /**
   * Initialize the analytics service
   */
  initialize(gtmId: string): void {
    if (this.isInitialized) {
      console.warn('Analytics service already initialized');
      return;
    }

    this.gtmId = gtmId;
    
    // Ensure dataLayer exists
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
    }

    this.isInitialized = true;
    console.log('Analytics service initialized with GTM ID:', gtmId);
  }

  /**
   * Check if analytics is enabled and user has consented
   */
  private isTrackingEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check if user has consented to analytics
    const consent = localStorage.getItem('cookie-consent');
    const analyticsEnabled = consent === 'accepted';
    
    return this.isInitialized && analyticsEnabled;
  }

  /**
   * Push data to GTM dataLayer
   */
  private pushToDataLayer(data: any): void {
    if (!this.isTrackingEnabled()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics event (disabled):', data);
      }
      return;
    }

    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push(data);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics event:', data);
      }
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string): void {
    const event: PageViewEvent = {
      event: 'page_view',
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href,
    };

    this.pushToDataLayer(event);
  }

  /**
   * Track custom event
   */
  trackEvent(
    eventName: string, 
    parameters: Record<string, any> = {}
  ): void {
    const event: CustomEvent = {
      event: eventName,
      ...parameters,
    };

    this.pushToDataLayer(event);
  }

  /**
   * Track conversion event
   */
  trackConversion(conversionType: string, value?: number): void {
    this.trackEvent('conversion', {
      conversion_type: conversionType,
      value: value,
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>): void {
    this.pushToDataLayer({
      event: 'user_properties',
      ...properties,
    });
  }

  /**
   * Track article engagement
   */
  trackArticleView(articleId: string, title: string, author?: string): void {
    this.trackEvent('article_view', {
      content_type: 'article',
      content_id: articleId,
      content_title: title,
      author: author,
    });
  }

  /**
   * Track article bookmark
   */
  trackArticleBookmark(articleId: string, title: string): void {
    this.trackEvent('article_bookmark', {
      content_type: 'article',
      content_id: articleId,
      content_title: title,
    });
  }

  /**
   * Track article share
   */
  trackArticleShare(articleId: string, title: string, platform: string): void {
    this.trackEvent('article_share', {
      content_type: 'article',
      content_id: articleId,
      content_title: title,
      share_platform: platform,
    });
  }

  /**
   * Track brief view
   */
  trackBriefView(briefId: string, title: string): void {
    this.trackEvent('brief_view', {
      content_type: 'brief',
      content_id: briefId,
      content_title: title,
    });
  }

  /**
   * Track brief bookmark
   */
  trackBriefBookmark(briefId: string, title: string): void {
    this.trackEvent('brief_bookmark', {
      content_type: 'brief',
      content_id: briefId,
      content_title: title,
    });
  }

  /**
   * Track brief share
   */
  trackBriefShare(briefId: string, title: string, platform: string): void {
    this.trackEvent('brief_share', {
      content_type: 'brief',
      content_id: briefId,
      content_title: title,
      share_platform: platform,
    });
  }

  /**
   * Track user signup
   */
  trackUserSignup(method: string = 'email'): void {
    this.trackEvent('user_signup', {
      signup_method: method,
    });
  }

  /**
   * Track user login
   */
  trackUserLogin(method: string = 'email'): void {
    this.trackEvent('user_login', {
      login_method: method,
    });
  }

  /**
   * Track comment post
   */
  trackCommentPost(contentType: string, contentId: string): void {
    this.trackEvent('comment_post', {
      content_type: contentType,
      content_id: contentId,
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: string): void {
    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_context: context,
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultsCount?: number): void {
    this.trackEvent('search', {
      search_term: query,
      results_count: resultsCount,
    });
  }

  /**
   * Track navigation
   */
  trackNavigation(from: string, to: string): void {
    this.trackEvent('navigation', {
      from_page: from,
      to_page: to,
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
