/**
 * Datafa.st Analytics Service
 * Privacy-focused analytics that doesn't require cookie consent
 */

declare global {
  interface Window {
    datafast?: {
      track: (event: string, properties?: Record<string, any>) => void;
    };
  }
}

export interface DatafastEvent {
  event: string;
  properties?: Record<string, any>;
}

export class DatafastService {
  private isInitialized: boolean = false;
  private siteId: string | null = null;

  /**
   * Initialize the Datafa.st analytics service
   */
  initialize(siteId: string): void {
    if (this.isInitialized) {
      console.warn('Datafa.st service already initialized');
      return;
    }

    this.siteId = siteId;
    
    // Load Datafa.st script
    if (typeof window !== 'undefined') {
      this.loadScript();
    }

    this.isInitialized = true;
    console.log('Datafa.st service initialized with site ID:', siteId);
  }

  /**
   * Load Datafa.st script
   */
  private loadScript(): void {
    const script = document.createElement('script');
    script.src = '/js/script.js'; // Use proxied URL to bypass adblockers
    script.setAttribute('data-website-id', this.siteId!);
    script.setAttribute('data-domain', 'thebullishbrief-next.vercel.app');
    script.defer = true;
    
    document.head.appendChild(script);
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string): void {
    if (!this.isInitialized) return;

    const event: DatafastEvent = {
      event: 'page_view',
      properties: {
        path,
        title: title || document.title,
        url: window.location.href,
        referrer: document.referrer,
      },
    };

    this.trackEvent(event);
  }

  /**
   * Track custom event
   */
  trackEvent(event: DatafastEvent): void {
    if (!this.isInitialized || typeof window === 'undefined') return;

    if (window.datafast) {
      window.datafast.track(event.event, event.properties);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Datafa.st event:', event);
      }
    }
  }

  /**
   * Track article view
   */
  trackArticleView(articleId: string, title: string, author?: string): void {
    this.trackEvent({
      event: 'article_view',
      properties: {
        content_type: 'article',
        content_id: articleId,
        content_title: title,
        author: author,
      },
    });
  }

  /**
   * Track article bookmark
   */
  trackArticleBookmark(articleId: string, title: string): void {
    this.trackEvent({
      event: 'article_bookmark',
      properties: {
        content_type: 'article',
        content_id: articleId,
        content_title: title,
      },
    });
  }

  /**
   * Track article share
   */
  trackArticleShare(articleId: string, title: string, platform: string): void {
    this.trackEvent({
      event: 'article_share',
      properties: {
        content_type: 'article',
        content_id: articleId,
        content_title: title,
        share_platform: platform,
      },
    });
  }

  /**
   * Track brief view
   */
  trackBriefView(briefId: string, title: string): void {
    this.trackEvent({
      event: 'brief_view',
      properties: {
        content_type: 'brief',
        content_id: briefId,
        content_title: title,
      },
    });
  }

  /**
   * Track brief bookmark
   */
  trackBriefBookmark(briefId: string, title: string): void {
    this.trackEvent({
      event: 'brief_bookmark',
      properties: {
        content_type: 'brief',
        content_id: briefId,
        content_title: title,
      },
    });
  }

  /**
   * Track brief share
   */
  trackBriefShare(briefId: string, title: string, platform: string): void {
    this.trackEvent({
      event: 'brief_share',
      properties: {
        content_type: 'brief',
        content_id: briefId,
        content_title: title,
        share_platform: platform,
      },
    });
  }

  /**
   * Track user signup
   */
  trackUserSignup(method: string = 'email'): void {
    this.trackEvent({
      event: 'user_signup',
      properties: {
        signup_method: method,
      },
    });
  }

  /**
   * Track user login
   */
  trackUserLogin(method: string = 'email'): void {
    this.trackEvent({
      event: 'user_login',
      properties: {
        login_method: method,
      },
    });
  }

  /**
   * Track comment post
   */
  trackCommentPost(contentType: string, contentId: string): void {
    this.trackEvent({
      event: 'comment_post',
      properties: {
        content_type: contentType,
        content_id: contentId,
      },
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultsCount?: number): void {
    this.trackEvent({
      event: 'search',
      properties: {
        search_term: query,
        results_count: resultsCount,
      },
    });
  }


}

// Export singleton instance
export const datafastService = new DatafastService();
