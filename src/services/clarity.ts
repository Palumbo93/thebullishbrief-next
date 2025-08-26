/**
 * Microsoft Clarity Analytics Service
 * Privacy-focused analytics with event tracking and heatmaps
 * Cookie-free implementation for GDPR compliance
 */

declare global {
  interface Window {
    clarity?: {
      (action: 'event', eventName: string): void;
      (action: 'identify', userData: Record<string, any>): void;
      (action: 'set', key: string, value: any): void;
      (action: string, ...args: any[]): void;
    };
  }
}

export interface ClarityEvent {
  event: string;
  properties?: Record<string, any>;
}

export class ClarityService {
  private isInitialized: boolean = false;

  /**
   * Initialize the Microsoft Clarity analytics service
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Script is loaded in HTML head, just wait for it to be available
    if (typeof window !== 'undefined') {
      this.waitForScript();
    }
    
    this.isInitialized = true;
  }

  /**
   * Wait for Clarity script to load
   */
  private waitForScript(): void {
    const checkScript = () => {
      if (window.clarity) {
        return;
      }
      
      // Check again in 100ms
      setTimeout(checkScript, 100);
    };
    
    checkScript();
  }

  /**
   * Debug function to check if Clarity is working
   */
  debug(): void {
    if (typeof window === 'undefined') {
      console.log('Clarity Debug: Server side, window not available');
      return;
    }

    if (window.clarity) {
      console.log('Clarity Debug: ✅ Microsoft Clarity is loaded and ready');
    } else {
      console.log('Clarity Debug: ❌ Microsoft Clarity is not loaded');
    }
  }

  /**
   * Track page view (automatic with Clarity, but can be called explicitly)
   */
  trackPageView(path: string, title?: string): void {
    if (!this.isInitialized) return;

    // Clarity handles page views automatically, but we can track custom properties
    this.trackEvent({
      event: 'Page View',
      properties: {
        path,
        title: title || (typeof document !== 'undefined' ? document.title : ''),
        url: typeof window !== 'undefined' ? window.location.href : '',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      },
    });
  }

  /**
   * Track custom event with Clarity
   */
  trackEvent(event: ClarityEvent): void {
    if (!this.isInitialized || typeof window === 'undefined') return;

    if (window.clarity) {
      // Use Clarity's event tracking
      window.clarity('event', event.event);
      
      // Store additional properties if provided
      if (event.properties && Object.keys(event.properties).length > 0) {
        window.clarity('identify', event.properties);
      }
    }
  }

  /**
   * Track article view
   */
  trackArticleView(articleId: string, title: string, author?: string): void {
    this.trackEvent({
      event: 'Article View',
      properties: {
        contentType: 'article',
        contentId: articleId,
        contentTitle: title,
        author: author,
      },
    });
  }

  /**
   * Track article bookmark
   */
  trackArticleBookmark(articleId: string, title: string): void {
    this.trackEvent({
      event: 'Article Bookmark',
      properties: {
        contentType: 'article',
        contentId: articleId,
        contentTitle: title,
      },
    });
  }

  /**
   * Track article share
   */
  trackArticleShare(articleId: string, title: string, platform: string): void {
    this.trackEvent({
      event: 'Article Share',
      properties: {
        contentType: 'article',
        contentId: articleId,
        contentTitle: title,
        sharePlatform: platform,
      },
    });
  }

  /**
   * Track brief view
   */
  trackBriefView(briefId: string, title: string): void {
    this.trackEvent({
      event: 'Brief View',
      properties: {
        contentType: 'brief',
        contentId: briefId,
        contentTitle: title,
      },
    });
  }

  /**
   * Track brief bookmark
   */
  trackBriefBookmark(briefId: string, title: string): void {
    this.trackEvent({
      event: 'Brief Bookmark',
      properties: {
        contentType: 'brief',
        contentId: briefId,
        contentTitle: title,
      },
    });
  }

  /**
   * Track brief share
   */
  trackBriefShare(briefId: string, title: string, platform: string): void {
    this.trackEvent({
      event: 'Brief Share',
      properties: {
        contentType: 'brief',
        contentId: briefId,
        contentTitle: title,
        sharePlatform: platform,
      },
    });
  }

  /**
   * Track user signup
   */
  trackUserSignup(method: string = 'email'): void {
    this.trackEvent({
      event: 'User Signup',
      properties: {
        signupMethod: method,
      },
    });
  }

  /**
   * Track user login
   */
  trackUserLogin(method: string = 'email'): void {
    this.trackEvent({
      event: 'User Login',
      properties: {
        loginMethod: method,
      },
    });
  }

  /**
   * Track comment post
   */
  trackCommentPost(contentType: string, contentId: string): void {
    this.trackEvent({
      event: 'Comment Post',
      properties: {
        contentType: contentType,
        contentId: contentId,
      },
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultsCount?: number): void {
    this.trackEvent({
      event: 'Search',
      properties: {
        searchTerm: query,
        resultsCount: resultsCount,
      },
    });
  }
}

// Export singleton instance
export const clarityService = new ClarityService();
