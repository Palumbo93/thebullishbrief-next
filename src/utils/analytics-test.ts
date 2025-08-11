/**
 * Analytics Test Utility
 * Use this to test analytics events in development
 */

import { analyticsService } from '../services/analytics';

export const testAnalytics = () => {
  if (import.meta.env.DEV) {
    console.log('🧪 Testing Analytics...');
    
    // Test page view
    analyticsService.trackPageView('/test', 'Test Page');
    
    // Test article events
    analyticsService.trackArticleView('test-article-id', 'Test Article', 'Test Author');
    analyticsService.trackArticleBookmark('test-article-id', 'Test Article');
    analyticsService.trackArticleShare('test-article-id', 'Test Article', 'twitter');
    
    // Test brief events
    analyticsService.trackBriefView('test-brief-id', 'Test Brief');
    analyticsService.trackBriefBookmark('test-brief-id', 'Test Brief');
    analyticsService.trackBriefShare('test-brief-id', 'Test Brief', 'linkedin');
    
    // Test user events
    analyticsService.trackUserSignup('email');
    analyticsService.trackUserLogin('email');
    
    // Test other events
    analyticsService.trackCommentPost('article', 'test-article-id');
    analyticsService.trackSearch('test query', 5);
    analyticsService.trackNavigation('/home', '/articles');
    
    console.log('✅ Analytics test completed. Check browser console for events.');
  }
};

// Auto-run test in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Add to window for manual testing
  (window as any).testAnalytics = testAnalytics;
}
